import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Prose } from './Prose';

it('Prose sets lang', () => {
  const { container } = render(<Prose paragraphs={['One', 'Two']} lang="fil" />);
  expect(container.firstElementChild?.getAttribute('lang')).toBe('fil');
});

it('renders one paragraph per entry at a readable measure', () => {
  render(<Prose paragraphs={['One', 'Two']} />);
  const ps = screen.getAllByText(/One|Two/);
  expect(ps).toHaveLength(2);
  expect(ps[0]?.tagName).toBe('P');
  expect(ps[0]?.classList.contains('max-w-[70ch]')).toBe(true);
});

it('omits lang when not given', () => {
  const { container } = render(<Prose paragraphs={['One']} />);
  expect(container.firstElementChild?.hasAttribute('lang')).toBe(false);
});
