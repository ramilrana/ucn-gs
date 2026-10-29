import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ActionLink } from './ActionLink';

describe('ActionLink', () => {
  it('external link opens in new tab with rel and sr text', () => {
    render(<ActionLink href="https://example.org/a">Open</ActionLink>);
    const link = screen.getByRole('link', { name: /Open/ });
    expect(link.getAttribute('href')).toBe('https://example.org/a');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent).toBe('Open (opens in new tab)');
    expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('external link can opt out of new tab', () => {
    render(<ActionLink href="https://example.org/a" newTab={false}>Stay</ActionLink>);
    const link = screen.getByRole('link', { name: 'Stay' });
    expect(link.hasAttribute('target')).toBe(false);
    expect(link.hasAttribute('rel')).toBe(false);
  });

  it('javascript: href renders plain text, no anchor', () => {
    render(<ActionLink href="javascript:alert(1)">Bad</ActionLink>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Bad')).not.toBeNull();
  });

  it('internal path renders a router link', () => {
    render(
      <MemoryRouter basename="/gs" initialEntries={['/gs/']}>
        <ActionLink href="/accreditation-areas">Areas</ActionLink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Areas' });
    // The router applies the basename itself; ActionLink must not add it twice.
    expect(link.getAttribute('href')).toBe('/gs/accreditation-areas');
    expect(link.hasAttribute('target')).toBe(false);
  });

  it('download link has download attribute and no target', () => {
    render(<ActionLink href="/gs/files/a.pdf" download>Download</ActionLink>);
    const link = screen.getByRole('link', { name: 'Download' });
    expect(link.hasAttribute('download')).toBe(true);
    expect(link.getAttribute('href')).toBe('/gs/files/a.pdf');
    expect(link.hasAttribute('target')).toBe(false);
  });

  it('mailto link is a plain anchor without new tab', () => {
    render(<ActionLink href="mailto:a@b.org">Mail</ActionLink>);
    const link = screen.getByRole('link', { name: 'Mail' });
    expect(link.getAttribute('href')).toBe('mailto:a@b.org');
    expect(link.hasAttribute('target')).toBe(false);
  });

  it('applies the variant classes', () => {
    render(<ActionLink href="https://example.org" variant="primary">Go</ActionLink>);
    expect(screen.getByRole('link').classList.contains('bg-maroon-800')).toBe(true);
  });
});
