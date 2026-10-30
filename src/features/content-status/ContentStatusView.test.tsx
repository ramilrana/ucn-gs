import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { ContentStatusView } from './ContentStatusView';

const entries = [
  { page: 'Home', path: '/', label: "Dean's photograph and message" },
  { page: 'About', path: '/about', label: 'Mission' },
];

it('renders a table with Page, Item and Link to page columns and a total', () => {
  render(<MemoryRouter><ContentStatusView entries={entries} /></MemoryRouter>);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Page', 'Item', 'Link to page']);
  expect(within(table).getAllByRole('row')).toHaveLength(3);
  expect(screen.getByText('Total pending: 2')).toBeTruthy();
  expect(within(table).getByRole('link', { name: '/about' }).getAttribute('href')).toBe('/about');
});

it('keeps the page links at least 24px tall and the path column readable at narrow widths', () => {
  render(<MemoryRouter><ContentStatusView entries={entries} /></MemoryRouter>);
  const link = within(screen.getByRole('table')).getByRole('link', { name: '/about' });
  const cell = link.closest('td');
  expect(cell?.className).toContain('[&>a]:min-h-6');
  expect(cell?.className).toMatch(/min-w-/);
});

it('says so when nothing is pending', () => {
  render(<MemoryRouter><ContentStatusView entries={[]} /></MemoryRouter>);
  expect(screen.queryByRole('table')).toBeNull();
  expect(screen.getByText('Total pending: 0')).toBeTruthy();
  expect(screen.getByText('Nothing is pending.')).toBeTruthy();
});
