import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { expect, it } from 'vitest';
import type { RouteEntry } from '../content/routes';
import AreaPage from './AreaPage';
import AreasIndexPage from './AreasIndexPage';

function renderAt(entry: RouteEntry | undefined) {
  const router = createMemoryRouter([{ path: '*', element: entry?.kind === 'areas-index' ? <AreasIndexPage /> : <AreaPage />, handle: { entry } }], {
    initialEntries: [entry?.path ?? '/accreditation-areas/unknown'],
  });
  render(<RouterProvider router={router} />);
}

it('AreaPage looks the area up by the route entry slug', () => {
  renderAt({
    path: '/accreditation-areas/sample-area',
    title: 'Sample area',
    kind: 'area',
    parentPath: '/accreditation-areas',
    slug: 'sample-area',
  });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Sample area');
});

it('AreaPage renders the 404 page for an unknown slug or a missing entry', () => {
  renderAt({ path: '/accreditation-areas/nope', title: 'Nope', kind: 'area', slug: 'nope' });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
});

it('AreaPage renders the 404 page without a route entry', () => {
  renderAt(undefined);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
});

it('AreasIndexPage lists the sample area in dev', () => {
  renderAt({ path: '/accreditation-areas', title: 'Accreditation Areas', kind: 'areas-index' });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Accreditation Areas');
  expect(screen.getByRole('link', { name: 'View Sample area' }).getAttribute('href')).toBe('/accreditation-areas/sample-area');
});
