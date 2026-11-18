import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { expect, it } from 'vitest';
import type { RouteEntry } from '../content/routes';
import ComplianceIndexPage from './ComplianceIndexPage';
import RecommendationPage from './RecommendationPage';

function renderAt(entry: RouteEntry | undefined) {
  const element = entry?.kind === 'compliance-index' ? <ComplianceIndexPage /> : <RecommendationPage />;
  const router = createMemoryRouter([{ path: '*', element, handle: { entry } }], {
    initialEntries: [entry?.path ?? '/compliance-report/sample-area/recommendation-0'],
  });
  render(<RouterProvider router={router} />);
}

it('RecommendationPage looks the recommendation up by the route entry slug and number', () => {
  renderAt({
    path: '/compliance-report/sample-area/recommendation-1',
    title: 'Sample area: Recommendation 1',
    kind: 'recommendation',
    parentPath: '/compliance-report',
    slug: 'sample-area',
    number: 1,
  });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Sample area: Recommendation 1');
  expect(screen.getByText('Sample recommendation')).toBeTruthy();
});

it('RecommendationPage renders the 404 page for an unknown number', () => {
  renderAt({
    path: '/compliance-report/sample-area/recommendation-7',
    title: 'Sample area: Recommendation 7',
    kind: 'recommendation',
    slug: 'sample-area',
    number: 7,
  });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
});

it('RecommendationPage renders the 404 page when the area slug does not match', () => {
  renderAt({
    path: '/compliance-report/no-such-area/recommendation-1',
    title: 'No such area: Recommendation 1',
    kind: 'recommendation',
    slug: 'no-such-area',
    number: 1,
  });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
});

it('RecommendationPage renders the 404 page without a route entry', () => {
  renderAt(undefined);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
});

it('ComplianceIndexPage groups the sample recommendation under its area in dev', () => {
  renderAt({
    path: '/compliance-report',
    title: 'Compliance Report',
    kind: 'compliance-index',
  });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Compliance Report');
  expect(screen.getByRole('heading', { level: 2, name: 'Sample area' })).toBeTruthy();
  const link = screen.getByRole('link', {
    name: 'Sample area, Recommendation 1: Sample recommendation',
  });
  expect(link.getAttribute('href')).toBe('/compliance-report/sample-area/recommendation-1');
});
