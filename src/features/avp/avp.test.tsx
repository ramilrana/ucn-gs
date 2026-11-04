import { act, render, screen, waitFor, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RootLayout } from '../../app/RootLayout';
import type { Area, Resource } from '../../types/content';
import { AvpView } from './AvpView';

const video = (id: string, title: string): Resource => ({
  id,
  title,
  format: 'video',
  status: 'published',
  source: { kind: 'youtube', videoId: 'dQw4w9WgXcQ' },
});

const makeArea = (slug: string, title: string, extra: Partial<Area> = {}): Area => ({
  slug,
  order: 1,
  title,
  status: 'published',
  gallery: { label: `${title} gallery`, status: 'pending' },
  narrativeReport: { id: `${slug}-nr`, title: `${title} narrative`, format: 'pdf', status: 'pending' },
  groups: [],
  additionalFiles: [],
  ...extra,
});

const areas: Area[] = [
  makeArea('governance', 'Governance', { avp: video('gov-avp', 'Governance AVP video') }),
  makeArea('research', 'Research', { avp: { ...video('res-avp', 'Research AVP video'), avpTitle: 'Research in Action' } }),
  makeArea('extension', 'Extension'),
  makeArea('hidden', 'Hidden area', { status: 'pending', avp: video('hid-avp', 'Hidden AVP video') }),
];

const renderUi = (ui: React.ReactElement, path = '/avp') => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

const settle = (ms = 50) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

/** jsdom has no scrollIntoView: define a spy and remove it again in afterEach. */
const stubScroll = () => {
  const spy = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', { value: spy, configurable: true, writable: true });
  return spy;
};

describe('AvpView', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('one section per area with avp, using avpTitle when present', () => {
    production();
    const { container } = renderUi(<AvpView areas={areas} />);
    expect(container.querySelectorAll('section')).toHaveLength(2);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Governance',
      'Research in Action',
    ]);
    expect(screen.getByText('Area: Research')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to Research' }).getAttribute('href')).toBe('/accreditation-areas/research');
    expect(screen.getByRole('link', { name: 'Go to Governance' })).toBeTruthy();
    // Areas without an AVP, and hidden areas, are left out.
    expect(screen.queryByText('Extension')).toBeNull();
    expect(screen.queryByText(/Hidden area/)).toBeNull();
  });

  it('section ids match area slugs', () => {
    production();
    const { container } = renderUi(<AvpView areas={areas} />);
    const ids = Array.from(container.querySelectorAll('section')).map((s) => s.id);
    expect(ids).toEqual(['governance', 'research']);
    const section = container.querySelector('#research') as HTMLElement;
    expect(within(section).getByRole('heading', { level: 2 }).textContent).toBe('Research in Action');
  });

  it('no iframe until play', () => {
    production();
    const { container } = renderUi(<AvpView areas={areas} />);
    expect(container.querySelectorAll('iframe')).toHaveLength(0);
    expect(screen.getAllByRole('button', { name: /Play video/ })).toHaveLength(2);
  });

  it('with no entries shows the preparing note', () => {
    production();
    renderUi(<AvpView areas={[areas[2] as Area, areas[3] as Area]} />);
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });

  it('scrolls to and focuses the h2 named by the hash', async () => {
    production();
    const scroll = stubScroll();
    renderUi(<AvpView areas={areas} />, '/avp#research');
    const h2 = screen.getByRole('heading', { level: 2, name: 'Research in Action' });
    expect(h2.getAttribute('tabindex')).toBe('-1');
    await waitFor(() => expect(document.activeElement).toBe(h2));
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('scrolls instantly under reduced motion', async () => {
    production();
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: true })) as typeof window.matchMedia;
    const scroll = stubScroll();
    try {
      renderUi(<AvpView areas={areas} />, '/avp#governance');
      await waitFor(() => expect(scroll).toHaveBeenCalled());
      expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    } finally {
      window.matchMedia = original;
    }
  });

  it('does nothing for an unknown hash', async () => {
    production();
    const scroll = stubScroll();
    renderUi(<AvpView areas={areas} />, '/avp#nope');
    await settle(20);
    expect(scroll).not.toHaveBeenCalled();
  });

  it('a malformed hash renders the page normally with no error page', async () => {
    production();
    const { container } = renderUi(<AvpView areas={areas} />, '/avp#%');
    await settle(20);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Audio Visual Presentations');
    expect(container.querySelectorAll('section')).toHaveLength(2);
    renderUi(<AvpView areas={areas} />, '/avp#%E0%A4%A');
    await settle(20);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(2);
  });

  it('a hash naming a non-AVP element focuses no AVP heading', async () => {
    production();
    const scroll = stubScroll();
    renderUi(
      <>
        <div id="main">
          <h2>Decoy heading</h2>
        </div>
        <AvpView areas={areas} />
      </>,
      '/avp#main',
    );
    await settle(20);
    expect(scroll).not.toHaveBeenCalled();
    expect(document.activeElement?.tagName).toBe('BODY');
  });

  it('the hash target wins over the layout focus on #page-title after navigation', async () => {
    production();
    stubScroll();
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [
            { index: true, element: <h1 id="page-title" tabIndex={-1}>Home</h1> },
            { path: 'avp', element: <AvpView areas={areas} /> },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );
    render(<RouterProvider router={router} />);
    await act(async () => {
      await router.navigate('/avp#research');
    });
    const h2 = screen.getByRole('heading', { level: 2, name: 'Research in Action' });
    await waitFor(() => expect(document.activeElement).toBe(h2));
    await settle();
    expect(document.activeElement).toBe(h2);
  });
});
