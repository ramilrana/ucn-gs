import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { localFileUrl } from '../../lib/resourceUrls';
import { ActionLink } from './ActionLink';

describe('ActionLink', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it.each([
    ['/gs/', '/gs'],
    ['/', '/'],
  ])('local file URL under base %s is a plain anchor, not a router link', (base, basename) => {
    vi.stubEnv('BASE_URL', base);
    const href = localFileUrl('/files/a.pdf', base);
    render(
      <MemoryRouter basename={basename} initialEntries={[basename === '/' ? '/' : `${basename}/`]}>
        <ActionLink href={href}>File</ActionLink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'File' });
    // A router Link would prepend the basename again (/gs/gs/files/a.pdf).
    expect(link.getAttribute('href')).toBe(base === '/' ? '/files/a.pdf' : '/gs/files/a.pdf');
  });

  it('local file URL with newTab still opens in a new tab as a plain anchor', () => {
    vi.stubEnv('BASE_URL', '/gs/');
    render(
      <MemoryRouter basename="/gs" initialEntries={['/gs/']}>
        <ActionLink href={localFileUrl('/files/a.pdf', '/gs/')} newTab>File</ActionLink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /File/ });
    expect(link.getAttribute('href')).toBe('/gs/files/a.pdf');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('an app route still uses a router link under a subpath base', () => {
    vi.stubEnv('BASE_URL', '/gs/');
    render(
      <MemoryRouter basename="/gs" initialEntries={['/gs/']}>
        <ActionLink href="/accreditation-areas">Areas</ActionLink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Areas' });
    expect(link.getAttribute('href')).toBe('/gs/accreditation-areas');
    // Router Link intercepts plain left clicks, so the default is prevented.
    expect(fireEvent.click(link)).toBe(false);
  });

  it('a root-relative path with a file extension is a plain anchor (dev sample PDF)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ActionLink href="/src/dev/sample.pdf?no-inline">Sample</ActionLink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Sample' });
    expect(link.getAttribute('href')).toBe('/src/dev/sample.pdf?no-inline');
    expect(fireEvent.click(link)).toBe(true);
  });

  it('a built asset path under a subpath base is not given the basename twice', () => {
    render(
      <MemoryRouter basename="/gs" initialEntries={['/gs/']}>
        <ActionLink href="/gs/assets/sample-abc.pdf">Sample</ActionLink>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Sample' }).getAttribute('href')).toBe('/gs/assets/sample-abc.pdf');
  });

  it('a dot in the query or hash, or in an earlier segment, does not make a route a file link', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ActionLink href="/about/people?ref=a.pdf">Q</ActionLink>
        <ActionLink href="/about/people#x.pdf">H</ActionLink>
        <ActionLink href="/v1.2/people">S</ActionLink>
      </MemoryRouter>,
    );
    for (const name of ['Q', 'H', 'S']) {
      expect(fireEvent.click(screen.getByRole('link', { name }))).toBe(false);
    }
  });

  it('an app route is still a router link', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ActionLink href="/about/people">People</ActionLink>
      </MemoryRouter>,
    );
    expect(fireEvent.click(screen.getByRole('link', { name: 'People' }))).toBe(false);
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

  it('link variant turns white inside an on-maroon container, since maroon text is invisible there', () => {
    render(<ActionLink href="https://example.org/a">Contact</ActionLink>);
    const cls = screen.getByRole('link').className;
    expect(cls).toContain('on-maroon:text-white');
    expect(cls).toContain('on-maroon:hover:text-white');
    // The custom variant skips white .on-light panels; the old descendant selector did not.
    expect(cls).not.toContain('[.on-maroon_&]');
  });

  it('transitions colours only, so the focus outline never fades in from white', () => {
    render(<ActionLink href="https://example.org/a" variant="primary">Go</ActionLink>);
    const cls = screen.getByRole('link').className;
    expect(cls).toContain('transition-[color,background-color,border-color]');
    expect(cls).not.toContain('transition-colors');
  });
});
