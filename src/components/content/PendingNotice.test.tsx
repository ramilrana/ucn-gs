import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PendingNotice } from './PendingNotice';

afterEach(() => vi.unstubAllEnvs());

it('PendingNotice renders nothing in production', () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_CONTENT_PREVIEW', '');
  const { container } = render(<PendingNotice label="Dean message" />);
  expect(container.innerHTML).toBe('');
});

it('PendingNotice shows the label in dev', () => {
  vi.stubEnv('DEV', true);
  render(<PendingNotice label="Dean message" />);
  const note = screen.getByRole('note');
  expect(note.textContent).toBe('Pending: Dean message');
  expect(note.classList.contains('border-dashed')).toBe(true);
  expect(note.classList.contains('border-line')).toBe(true);
});
