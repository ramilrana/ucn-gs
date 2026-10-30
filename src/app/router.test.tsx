import * as React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, configure, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom';
import type { Area, Recommendation, Resource } from '../types/content';
import { buildRouteManifest } from '../content/routes';
import { RootLayout } from './RootLayout';
import { buildRouteObjects } from './router';

const pendingDoc: Resource = { id: 'doc', title: 'Doc', format: 'pdf', status: 'pending' };
// The area and recommendation pages look their data up in the real content (which includes the dev
// samples under test), so these fixtures use the sample slug and number.
const area: Area = {
  slug: 'sample-area',
  order: 1,
  title: 'Sample area',
  status: 'published',
  gallery: { label: 'Gallery', status: 'pending' },
  narrativeReport: pendingDoc,
  groups: [],
  additionalFiles: [],
};
const rec: Recommendation = {
  number: 99,
  title: 'Sample recommendation',
  status: 'published',
  document: pendingDoc,
  evidence: [],
  additionalFiles: [],
};

const manifest = buildRouteManifest({ areas: [area], recommendations: [rec], includePending: true });
const HOME_NAME = 'University of Camarines Norte Graduate School';

function renderAt(path: string, routes: RouteObject[] = buildRouteObjects(manifest)) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

/** The app's root route with extra child routes in front, so tests can add a Link or a slow page. */
function withExtraRoutes(extra: RouteObject[]): RouteObject[] {
  const [root] = buildRouteObjects(manifest);
  if (!root) throw new Error('missing root route');
  return [{ path: '/', Component: RootLayout, children: [...extra, ...(root.children ?? [])] }];
}

function LatePage() {
  // The heading appears after the route has already rendered.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 30);
    return () => clearTimeout(t);
  }, []);
  return ready ? (
    <h1 id="page-title" tabIndex={-1}>
      Late page
    </h1>
  ) : null;
}

// The router loads every page lazily. Importing them once up front keeps a cold module graph (slow
// on the OneDrive-hosted repo) from eating the 1 s findByRole budget of whichever test runs first.
beforeAll(async () => {
  await Promise.all(Object.values(import.meta.glob('../pages/*Page.tsx')).map((load) => load()));
}, 60_000);

// Under full-suite load on the OneDrive-hosted repo, the first lazy route can need more than the default
// 1 s findBy* budget. This only raises the ceiling for this file; tests still resolve as soon as they can.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  window.scrollTo = vi.fn();
  document.title = '';
});

describe('app router', () => {
  it.each(manifest.map((e) => [e.path, e.path === '/' ? HOME_NAME : e.title] as const))(
    'renders the h1 for %s',
    async (path, name) => {
      renderAt(path);
      expect(await screen.findByRole('heading', { level: 1, name })).toBeTruthy();
    },
  );

  it('renders the page with a trailing slash', async () => {
    renderAt('/accreditation-areas/sample-area/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Sample area' })).toBeTruthy();
  });

  it('unknown path renders the 404 page', async () => {
    renderAt('/nope');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeTruthy();
  });

  it('unknown area slug renders the 404 page', async () => {
    renderAt('/accreditation-areas/does-not-exist');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeTruthy();
  });

  it('sets document.title', async () => {
    renderAt('/about/people');
    await screen.findByRole('heading', { level: 1 });
    await vi.waitFor(() => expect(document.title).toBe('Faculty, Staff and Student Assistants · UCN Graduate School'));
  });

  it('sets the bare site title on Home', async () => {
    renderAt('/');
    await screen.findByRole('heading', { level: 1 });
    await vi.waitFor(() => expect(document.title).toBe('UCN Graduate School Accreditation'));
  });

  it('does not move focus on first load', async () => {
    renderAt('/about');
    await screen.findByRole('heading', { level: 1 });
    expect(document.activeElement).toBe(document.body);
  });

  it('moves focus to the h1 after client navigation', async () => {
    renderAt('/start', withExtraRoutes([{ path: 'start', element: <Link to="/about">Go to About</Link> }]));
    await userEvent.click(await screen.findByRole('link', { name: 'Go to About' }));
    const h1 = await screen.findByRole('heading', { level: 1, name: 'About the Graduate School' });
    await vi.waitFor(() => expect(document.activeElement).toBe(h1));
    expect(h1.id).toBe('page-title');
  });

  it('focuses the h1 even when it mounts after the pathname changes', async () => {
    const router = renderAt('/about', withExtraRoutes([{ path: 'late', Component: LatePage }]));
    await screen.findByRole('heading', { level: 1, name: 'About the Graduate School' });
    await act(async () => {
      await router.navigate('/late');
    });
    const h1 = await screen.findByRole('heading', { level: 1, name: 'Late page' });
    await vi.waitFor(() => expect(document.activeElement).toBe(h1));
  });

  it('a failed lazy chunk shows the styled error page with a reload button', async () => {
    const [root] = buildRouteObjects(manifest);
    if (!root) throw new Error('missing root route');
    const routes: RouteObject[] = [
      {
        path: '/',
        Component: root.Component,
        ErrorBoundary: root.ErrorBoundary,
        children: [
          { path: 'broken', lazy: () => Promise.reject(new Error('Failed to fetch dynamically imported module')) },
          ...(root.children ?? []),
        ],
      },
    ];
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      renderAt('/broken', routes);
      const h1 = await screen.findByRole('heading', { level: 1, name: 'Something went wrong' });
      expect(h1.id).toBe('page-title');
      expect(h1.getAttribute('tabindex')).toBe('-1');
      expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy();
      expect(screen.queryByText(/Unexpected Application Error/)).toBeNull();
    } finally {
      consoleError.mockRestore();
    }
  });
});
