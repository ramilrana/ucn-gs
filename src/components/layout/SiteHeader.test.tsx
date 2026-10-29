import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { buildRouteObjects } from '../../app/router';
import { buildRouteManifest } from '../../content/routes';
import type { Area, Recommendation, Resource } from '../../types/content';
import { SiteHeader } from './SiteHeader';

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

function renderHeader(path = '/compliance-report/recommendation-1') {
  const router = createMemoryRouter([{ path: '*', element: <SiteHeader manifest={manifest} /> }], {
    initialEntries: [path],
  });
  render(<RouterProvider router={router} />);
  return router;
}

const desktopNav = () => screen.getByRole('navigation', { name: 'Main' });

function getDialog(): HTMLDialogElement {
  const dialog = document.querySelector('dialog');
  if (!dialog) throw new Error('missing dialog');
  return dialog;
}

describe('SiteHeader', () => {
  it('marks Compliance Report as current ancestor', () => {
    renderHeader();
    const nav = within(desktopNav());
    expect(nav.getByRole('link', { name: 'Compliance Report' }).getAttribute('aria-current')).toBe('true');
    expect(nav.getByRole('link', { name: 'Recommendation 1', hidden: true }).getAttribute('aria-current')).toBe('page');
    expect(nav.getByRole('link', { name: 'Home' }).hasAttribute('aria-current')).toBe(false);
    expect(nav.getByRole('link', { name: 'AVP' }).hasAttribute('aria-current')).toBe(false);
  });

  it('marks an exact match as the current page', () => {
    renderHeader('/avp');
    expect(within(desktopNav()).getByRole('link', { name: 'AVP' }).getAttribute('aria-current')).toBe('page');
  });

  it('dropdown button toggles aria-expanded and Esc returns focus', async () => {
    const user = userEvent.setup();
    renderHeader();
    const button = within(desktopNav()).getByRole('button', { name: /Compliance Report/ });
    const panelId = button.getAttribute('aria-controls') ?? '';
    expect(panelId).not.toBe('');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById(panelId)?.hasAttribute('hidden')).toBe(true);

    await user.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(panelId)?.hasAttribute('hidden')).toBe(false);

    await user.tab(); // into the first dropdown link
    expect(document.activeElement).not.toBe(button);
    await user.keyboard('{Escape}');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('closes on outside click and when focus leaves the item', async () => {
    const user = userEvent.setup();
    renderHeader();
    const button = within(desktopNav()).getByRole('button', { name: /Compliance Report/ });
    await user.click(button);
    await user.click(document.body);
    expect(button.getAttribute('aria-expanded')).toBe('false');

    await user.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    // Tab through the dropdown links and out to the next nav item.
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    const count = panel?.querySelectorAll('a').length ?? 0;
    for (let i = 0; i <= count; i += 1) await user.tab();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('opening one dropdown closes the other', async () => {
    const user = userEvent.setup();
    renderHeader();
    const nav = within(desktopNav());
    const compliance = nav.getByRole('button', { name: /Compliance Report/ });
    const about = nav.getByRole('button', { name: /About/ });
    await user.click(compliance);
    expect(compliance.getAttribute('aria-expanded')).toBe('true');
    await user.click(about);
    expect(about.getAttribute('aria-expanded')).toBe('true');
    expect(compliance.getAttribute('aria-expanded')).toBe('false');
  });

  it('mobile menu opens a dialog and closes on link click', async () => {
    const user = userEvent.setup();
    renderHeader('/');
    const dialog = getDialog();
    expect(dialog.hasAttribute('open')).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(dialog.hasAttribute('open')).toBe(true);

    await user.click(within(dialog).getByRole('button', { name: /Close/ }));
    expect(dialog.hasAttribute('open')).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(within(dialog).getByRole('link', { name: 'AVP' }));
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('mobile groups keep a link to the index page', async () => {
    const user = userEvent.setup();
    renderHeader('/');
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    const links = within(getDialog())
      .getAllByRole('link', { hidden: true })
      .map((l) => l.getAttribute('href'));
    expect(links).toContain('/compliance-report');
    expect(links).toContain('/compliance-report/recommendation-2');
    expect(links).toContain('/about');
  });

  it('logo has alt text and links home', () => {
    renderHeader();
    const logo = screen.getByAltText('University of Camarines Norte seal');
    expect(logo.closest('a')?.getAttribute('href')).toBe('/');
    expect(logo.getAttribute('height')).toBe('48');
    expect(screen.getByText('Graduate School')).toBeTruthy();
  });
});

describe('RootLayout skip link', () => {
  it('skip link targets #main', async () => {
    const router = createMemoryRouter(buildRouteObjects(manifest), { initialEntries: ['/about'] });
    render(<RouterProvider router={router} />);
    const skip = await screen.findByRole('link', { name: 'Skip to main content' });
    expect(skip.getAttribute('href')).toBe('#main');
    expect(document.getElementById('main')?.tagName).toBe('MAIN');
    await screen.findByRole('heading', { level: 1 });
    // The skip link is the first focusable element on the page.
    await userEvent.setup().tab();
    expect(document.activeElement).toBe(skip);
  });
});
