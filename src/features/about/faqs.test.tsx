import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Faq, SiteContent } from '../../types/content';
import { FaqsLocationView } from './FaqsLocationView';

const renderUi = (ui: React.ReactElement) => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: ['/about/faqs-and-location'] });
  return render(<RouterProvider router={router} />);
};

const production = () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
};

const faq = (id: string, question: string, status: Faq['status'] = 'published'): Faq => ({
  id,
  question,
  answer: [`Answer to ${question}`, 'Second paragraph.'],
  status,
});

const pendingSite: SiteContent = {
  universityName: 'University of Camarines Norte',
  schoolName: 'Graduate School',
  programName: { status: 'pending', label: 'Program' },
  areasLabel: 'Accreditation Areas',
  contentUpdated: '2026-10-29',
  contact: { status: 'pending', label: 'Campus address and contact details' },
  mapQuery: { status: 'pending', label: 'Campus map search' },
};

const publishedSite: SiteContent = {
  ...pendingSite,
  contact: { status: 'published', label: 'Contact', value: { address: '1 Sample Street, Sample City' } },
  mapQuery: { status: 'published', label: 'Map', value: '1 Sample Street, Sample City' },
};

describe('FaqsLocationView', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('each FAQ is a details element, collapsed by default', () => {
    production();
    const { container } = renderUi(
      <FaqsLocationView faqs={[faq('a', 'First question?'), faq('b', 'Second question?'), faq('c', 'Hidden?', 'pending')]} site={pendingSite} />,
    );
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(2);
    for (const item of details) expect(item.hasAttribute('open')).toBe(false);
    expect(details[0]?.querySelector('summary')?.textContent).toContain('First question?');
    expect(screen.getByRole('heading', { level: 2, name: 'Frequently Asked Questions' })).toBeTruthy();
    // The answer is rendered as paragraphs.
    expect(details[0]?.querySelectorAll('p')).toHaveLength(2);
    expect(screen.queryByText('Hidden?')).toBeNull();
  });

  // jsdom does not implement the browser rule "Enter/Space on a focused <summary> fires click", and user-event
  // does not synthesize it, so a literal Enter keypress cannot toggle <details> here. What can be verified is that
  // the summary is natively focusable and that activating it (the click Enter/Space produce in browsers) toggles it.
  // The real Enter/Space check happens in the Task 27 browser keyboard pass.
  it('FAQ summary is focusable and activation toggles it', async () => {
    production();
    const user = userEvent.setup();
    const { container } = renderUi(<FaqsLocationView faqs={[faq('a', 'First question?')]} site={pendingSite} />);
    const details = container.querySelector('details');
    const summary = container.querySelector('summary');
    expect(details?.hasAttribute('open')).toBe(false);

    await user.tab();
    // The skip link or breadcrumbs may come first; tab until the summary is reached.
    for (let i = 0; i < 10 && document.activeElement !== summary; i += 1) await user.tab();
    expect(document.activeElement).toBe(summary);

    await user.click(summary as HTMLElement);
    expect(details?.hasAttribute('open')).toBe(true);
    await user.click(summary as HTMLElement);
    expect(details?.hasAttribute('open')).toBe(false);
  });

  it('map section shows fallback link', () => {
    production();
    const { container } = renderUi(<FaqsLocationView faqs={[]} site={publishedSite} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Location' })).toBeTruthy();
    expect(screen.getByText('1 Sample Street, Sample City')).toBeTruthy();
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
    const link = screen.getByRole('link', { name: /Open in Google Maps/ });
    expect(link.getAttribute('href')).toContain('https://www.google.com/maps/search/');
    // No FAQs published: no FAQ heading in production.
    expect(screen.queryByRole('heading', { name: 'Frequently Asked Questions' })).toBeNull();
  });

  it('everything pending in prod shows the preparing note', () => {
    production();
    const { container } = renderUi(<FaqsLocationView faqs={[faq('c', 'Hidden?', 'pending')]} site={pendingSite} />);
    expect(screen.getByText('Materials for this page are being prepared.')).toBeTruthy();
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
    expect(container.querySelector('details')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('when pending content is shown, empty sections explain what is missing', () => {
    vi.stubEnv('VITE_CONTENT_PREVIEW', 'true');
    renderUi(<FaqsLocationView faqs={[]} site={pendingSite} />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Frequently Asked Questions',
      'Location',
    ]);
    expect(screen.getByText('Pending: Campus address and contact details')).toBeTruthy();
    expect(screen.getByText('Pending: Campus map search')).toBeTruthy();
  });
});
