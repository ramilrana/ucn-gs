import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { site } from '../../content';
import { buildRouteManifest, type RouteEntry } from '../../content/routes';
import type { Area, Recommendation, Resource } from '../../types/content';
import { Breadcrumbs } from './Breadcrumbs';
import { PageShell } from './PageShell';
import { Pager } from './Pager';
import { SiteFooter } from './SiteFooter';
import { buildCrumbs } from './crumbs';

const doc: Resource = { id: 'doc', title: 'Doc', format: 'pdf', status: 'pending' };
const area: Area = {
  slug: 'research',
  order: 1,
  title: 'Research',
  status: 'published',
  gallery: { label: 'Gallery', status: 'pending' },
  narrativeReport: doc,
  groups: [],
  additionalFiles: [],
};
const rec = (number: number): Recommendation => ({
  number,
  title: `Rec ${number}`,
  status: 'published',
  document: doc,
  evidence: [],
  additionalFiles: [],
});
const manifest = buildRouteManifest({ areas: [area], recommendations: [rec(1), rec(2)], includePending: false });

function entryFor(path: string): RouteEntry {
  const entry = manifest.find((candidate) => candidate.path === path);
  if (!entry) throw new Error(`no manifest entry for ${path}`);
  return entry;
}

/** Renders `element` as the page at `path`, with that path's manifest entry as the route handle. */
function renderPage(path: string, element: ReactNode) {
  const router = createMemoryRouter([{ path: '*', handle: { entry: entryFor(path) }, element }], {
    initialEntries: [path],
  });
  return render(<RouterProvider router={router} />);
}

function renderPlain(element: ReactNode, path = '/') {
  const router = createMemoryRouter([{ path: '*', element }], { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildCrumbs', () => {
  it('crumbs for a recommendation are Home › Compliance Report › Recommendation 1', () => {
    const crumbs = buildCrumbs(entryFor('/compliance-report/recommendation-1'), manifest);
    expect(crumbs).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Compliance Report', path: '/compliance-report' },
      { label: 'Recommendation 1' },
    ]);
  });

  it('a top-level page is Home › page', () => {
    expect(buildCrumbs(entryFor('/avp'), manifest)).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Audio Visual Presentations' },
    ]);
  });
});

describe('Breadcrumbs', () => {
  it('marks the last crumb as the current page', () => {
    renderPage('/compliance-report/recommendation-1', <Breadcrumbs manifest={manifest} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const items = within(nav).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Home', 'Compliance Report', 'Recommendation 1']);
    expect(items[2]?.querySelector('[aria-current="page"]')?.textContent).toBe('Recommendation 1');
    expect(within(nav).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/compliance-report',
    ]);
  });

  it('no breadcrumbs on Home', () => {
    renderPage('/', <Breadcrumbs manifest={manifest} />);
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
  });

  it('no breadcrumbs on a route without a manifest entry', () => {
    renderPlain(<Breadcrumbs manifest={manifest} />, '/nope');
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
  });
});

describe('PageShell', () => {
  it('PageShell shows the preparing note when hasContent is false', () => {
    renderPage(
      '/avp',
      <PageShell title="Audio Visual Presentations" hasContent={false}>
        Real content
      </PageShell>,
    );
    expect(screen.getByText('Materials for this page are being prepared.')).not.toBeNull();
    expect(screen.queryByText('Real content')).toBeNull();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Audio Visual Presentations' });
    expect(h1.id).toBe('page-title');
    expect(h1.getAttribute('tabindex')).toBe('-1');
  });

  it('PageShell renders children when hasContent is true', () => {
    renderPage(
      '/avp',
      <PageShell title="Audio Visual Presentations" hasContent>
        Real content
      </PageShell>,
    );
    expect(screen.getByText('Real content')).not.toBeNull();
    expect(screen.queryByText('Materials for this page are being prepared.')).toBeNull();
  });

  it('PageHeader renders the intro and sets the document title', () => {
    renderPage(
      '/avp',
      <PageShell title="Audio Visual Presentations" intro={['First paragraph.', 'Second paragraph.']} hasContent>
        x
      </PageShell>,
    );
    expect(screen.getByText('First paragraph.')).not.toBeNull();
    expect(screen.getByText('Second paragraph.')).not.toBeNull();
    expect(document.title).toBe('Audio Visual Presentations · UCN Graduate School');
  });
});

describe('Pager', () => {
  const items = [
    { title: 'Rec 1', path: '/compliance-report/recommendation-1' },
    { title: 'Rec 2', path: '/compliance-report/recommendation-2' },
    { title: 'Rec 3', path: '/compliance-report/recommendation-3' },
  ];

  it('Pager on the first item has only Next', () => {
    renderPlain(<Pager items={items} currentPath="/compliance-report/recommendation-1" />);
    expect(screen.getByRole('navigation', { name: 'Pager' })).not.toBeNull();
    expect(screen.queryByRole('link', { name: /^Previous/ })).toBeNull();
    const next = screen.getByRole('link', { name: 'Next: Rec 2' });
    expect(next.getAttribute('href')).toBe('/compliance-report/recommendation-2');
  });

  it('Pager on the last item has only Previous', () => {
    renderPlain(<Pager items={items} currentPath="/compliance-report/recommendation-3/" />);
    expect(screen.getByRole('link', { name: 'Previous: Rec 2' })).not.toBeNull();
    expect(screen.queryByRole('link', { name: /^Next/ })).toBeNull();
  });

  it('Pager in the middle has both', () => {
    renderPlain(<Pager items={items} currentPath="/compliance-report/recommendation-2" />);
    expect(screen.getByRole('link', { name: 'Previous: Rec 1' })).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Next: Rec 3' })).not.toBeNull();
  });

  it('Pager renders nothing for a single item or an unknown current path', () => {
    const { unmount } = renderPlain(<Pager items={items.slice(0, 1)} currentPath={items[0]?.path ?? ''} />);
    expect(screen.queryByRole('navigation', { name: 'Pager' })).toBeNull();
    unmount();
    renderPlain(<Pager items={items} currentPath="/elsewhere" />);
    expect(screen.queryByRole('navigation', { name: 'Pager' })).toBeNull();
  });
});

describe('SiteFooter', () => {
  it('footer hides pending contact', () => {
    vi.stubEnv('DEV', false);
    renderPlain(<SiteFooter manifest={manifest} />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).not.toContain(site.contact.label);
    expect(within(footer).queryByText(/Pending/)).toBeNull();
    expect(within(footer).queryByRole('link', { name: /@/ })).toBeNull();
  });

  it('footer shows published contact details', () => {
    renderPlain(
      <SiteFooter
        manifest={manifest}
        contact={{
          label: 'Contact',
          status: 'published',
          value: { address: '1 Test Road', email: 'gs@example.org', phone: '+63 000 000 0000' },
        }}
      />,
    );
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText('1 Test Road')).not.toBeNull();
    expect(within(footer).getByRole('link', { name: 'gs@example.org' }).getAttribute('href')).toBe(
      'mailto:gs@example.org',
    );
    expect(within(footer).getByRole('link', { name: '+63 000 000 0000' }).getAttribute('href')).toBe(
      'tel:+630000000000',
    );
  });

  it('footer formats contentUpdated', () => {
    renderPlain(<SiteFooter manifest={manifest} />);
    expect(screen.getByText('Content last updated October 29, 2026')).not.toBeNull();
  });

  it('footer shows the copyright line, the names and the main links', () => {
    renderPlain(<SiteFooter manifest={manifest} />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('bg-maroon-900');
    expect(footer.className).toContain('on-maroon');
    expect(within(footer).getByText(`© ${new Date().getFullYear()} University of Camarines Norte`)).not.toBeNull();
    expect(within(footer).getByText('Graduate School')).not.toBeNull();
    const links = within(within(footer).getByRole('navigation', { name: 'Footer' })).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Home',
      'Accreditation Areas',
      'Compliance Report',
      'AVP',
      'Documents',
      'About',
    ]);
  });
});
