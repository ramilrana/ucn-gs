import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorPage } from './ErrorPage';

afterEach(() => {
  vi.unstubAllEnvs();
  document.title = '';
});

describe('ErrorPage', () => {
  it('sets a descriptive document title (2.4.2) without needing a router', () => {
    document.title = 'Previous page · UCN Graduate School';
    render(<ErrorPage />);
    expect(document.title).toBe('Something went wrong · UCN Graduate School');
  });

  it('offers a plain anchor home that works even when the router failed', () => {
    vi.stubEnv('BASE_URL', '/gs/');
    // No RouterProvider here: a router Link would throw.
    render(<ErrorPage />);
    const home = screen.getByRole('link', { name: 'Go to the home page' });
    expect(home.getAttribute('href')).toBe('/gs/');
  });

  it('keeps the heading as the focus target and the Reload button', () => {
    render(<ErrorPage />);
    const h1 = screen.getByRole('heading', { level: 1, name: 'Something went wrong' });
    expect(h1.id).toBe('page-title');
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy();
  });

  it('the Reload button does not fade the focus outline from white', () => {
    render(<ErrorPage />);
    const button = screen.getByRole('button', { name: 'Reload page' });
    expect(button.className).not.toContain('transition-colors');
    expect(button.className).toContain('transition-[color,background-color,border-color]');
  });
});
