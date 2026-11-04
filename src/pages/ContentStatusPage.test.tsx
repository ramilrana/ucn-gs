import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import type { RouteEntry } from '../content/routes';
import ContentStatusPage from './ContentStatusPage';

afterEach(() => vi.unstubAllEnvs());

const entry: RouteEntry = { path: '/content-status', title: 'Content status', kind: 'content-status', devOnly: true };

function renderPage() {
  const router = createMemoryRouter([{ path: '/content-status', element: <ContentStatusPage />, handle: { entry } }], {
    initialEntries: ['/content-status'],
  });
  render(<RouterProvider router={router} />);
}

it('shows the pending table when pending content is shown', () => {
  vi.stubEnv('DEV', true);
  renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Content status' })).toBeTruthy();
  expect(screen.getByRole('table')).toBeTruthy();
  expect(screen.getByText("Dean's photograph and message")).toBeTruthy();
  expect(screen.getByText('Area list not supplied')).toBeTruthy();
  // Samples are in the merged lists in dev but never in the checklist.
  expect(screen.queryByText(/sample/i)).toBeNull();
});

it('renders the not-found page in production', () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
  renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
  expect(screen.queryByRole('table')).toBeNull();
});
