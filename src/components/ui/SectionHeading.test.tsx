import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SectionHeading } from './SectionHeading';

it('renders the requested level with an id', () => {
  render(<SectionHeading level={3} id="x">Title</SectionHeading>);
  const h = screen.getByRole('heading', { level: 3, name: 'Title' });
  expect(h.getAttribute('id')).toBe('x');
});

it('shows the gold rule only inside .on-maroon', () => {
  render(<SectionHeading level={2}>Title</SectionHeading>);
  const cls = screen.getByRole('heading', { level: 2 }).className;
  expect(cls).toContain('after:hidden');
  expect(cls).toContain('on-maroon:after:block');
  expect(cls).toContain('on-maroon:text-white');
  expect(cls).not.toContain('[.on-maroon_&]');
  expect(cls).toContain('after:bg-gold-500');
});
