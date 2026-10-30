import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { expect, it } from 'vitest';
import type { RouteEntry } from '../content/routes';
import ComplianceIndexPage from './ComplianceIndexPage';
import RecommendationPage from './RecommendationPage';

function renderAt(entry: RouteEntry | undefined) {
  const element = entry?.kind === 'compliance-index' ? <ComplianceIndexPage /> : <RecommendationPage />;
  const router = createMemoryRouter([{ path: '*', element, handle: { entry } }], {
    initialEntries: [entry?.path ?? '/compliance-report/recommendation-0'],
  });
  render(<RouterProvider router={router} />);
}

it('RecommendationPage looks the recommendation up by the route entry number', () => {
  renderAt({
    path: '/compliance-report/recommendation-99',
    title: 'Recommendation 99',
    kind: 'recommendation',
    parentPath: '/compliance-report',
    number: 99,
  });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Recommendation 99');
  expect(screen.getByText('Sample recommendation')).toBeTruthy();
});

it('RecommendationPage renders the 404 page for an unknown number', () => {
  renderAt({ path: '/compliance-report/recommendation-7', title: 'Recommendation 7', kind: 'recommendation', number: 7 });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
});

it('RecommendationPage renders the 404 page without a route entry', () => {
  renderAt(undefined);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
});

it('ComplianceIndexPage lists the sample recommendation in dev', () => {
  renderAt({ path: '/compliance-report', title: 'Compliance Report', kind: 'compliance-index' });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Compliance Report');
  const link = screen.getByRole('link', { name: 'Recommendation 99: Sample recommendation' });
  expect(link.getAttribute('href')).toBe('/compliance-report/recommendation-99');
});
