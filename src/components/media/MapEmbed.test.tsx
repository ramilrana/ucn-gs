import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Slot } from '../../types/content';
import { MapEmbed } from './MapEmbed';

const published = (value: string): Slot<string> => ({ label: 'Map location', status: 'published', value });
const pending: Slot<string> = { label: 'Map location', status: 'pending' };
const renderMap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('MapEmbed', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('map renders iframe and fallback link with encoded query', () => {
    renderMap(<MapEmbed query={published('Daet & Camarines Norte, PH')} address="Daet Campus" />);
    const frame = screen.getByTitle('Map of Daet Campus');
    expect(frame.getAttribute('src')).toBe(
      'https://www.google.com/maps?q=Daet%20%26%20Camarines%20Norte%2C%20PH&output=embed',
    );
    expect(frame.getAttribute('loading')).toBe('lazy');
    expect(frame.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-popups allow-presentation');
    expect(frame.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    const link = screen.getByRole('link', { name: /Open in Google Maps/ });
    expect(link.getAttribute('href')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Daet%20%26%20Camarines%20Norte%2C%20PH',
    );
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('title falls back to the query when no address is given', () => {
    renderMap(<MapEmbed query={published('Daet')} />);
    expect(screen.getByTitle('Map of Daet')).toBeTruthy();
  });

  it('pending map shows PendingNotice in dev, never an iframe', () => {
    vi.stubEnv('DEV', true);
    const { container } = renderMap(<MapEmbed query={pending} />);
    expect(screen.getByRole('note').textContent).toBe('Pending: Map location');
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('pending map is hidden in production', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_CONTENT_PREVIEW', '');
    const { container } = renderMap(<MapEmbed query={pending} />);
    expect(container.innerHTML).toBe('');
  });
});
