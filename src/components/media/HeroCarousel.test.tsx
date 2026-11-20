import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ImageAsset } from '../../types/content';
import { HERO_INTERVAL_MS, HeroCarousel } from './HeroCarousel';

const slides: ImageAsset[] = [1, 2, 3].map((n) => ({ src: `/s${n}.webp`, width: 1056, height: 594, alt: `Slide ${n}` }));

const currentDot = () => screen.getByRole('button', { current: true }).getAttribute('aria-label');
const tick = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

const setReducedMotion = (reduce: boolean) => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) => ({ matches: reduce && query.includes('reduce'), media: query }) as MediaQueryList,
  );
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('HeroCarousel', () => {
  it('is a labelled full-width carousel whose track moves to the current slide', () => {
    const { container } = render(<HeroCarousel label="Leadership" slides={slides} />);
    const region = screen.getByRole('region', { name: 'Leadership' });
    expect(region.className).toContain('w-full');
    expect((container.querySelector('[data-track]') as HTMLElement).style.transform).toBe('translateX(-0%)');
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect((container.querySelector('[data-track]') as HTMLElement).style.transform).toBe('translateX(-100%)');
    expect(currentDot()).toBe('Show slide 2');
  });

  it('only the current slide is exposed; the others are hidden and inert', () => {
    const { container } = render(<HeroCarousel label="Leadership" slides={slides} />);
    const groups = Array.from(container.querySelectorAll('[aria-roledescription="slide"]'));
    expect(groups.map((g) => g.getAttribute('aria-hidden'))).toEqual([null, 'true', 'true']);
    expect(groups.map((g) => g.hasAttribute('inert'))).toEqual([false, true, true]);
  });

  it('advances on its own and wraps around', () => {
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    tick(HERO_INTERVAL_MS);
    expect(currentDot()).toBe('Show slide 2');
    tick(HERO_INTERVAL_MS);
    tick(HERO_INTERVAL_MS);
    expect(currentDot()).toBe('Show slide 1');
  });

  it('the Pause button stops it and Play starts it again', () => {
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    tick(HERO_INTERVAL_MS * 3);
    expect(currentDot()).toBe('Show slide 1');
    fireEvent.click(screen.getByRole('button', { name: 'Play slideshow' }));
    // Clicking Play moved focus into the carousel, which also pauses it until focus leaves.
    fireEvent.blur(screen.getByRole('button', { name: 'Pause slideshow' }));
    tick(HERO_INTERVAL_MS);
    expect(currentDot()).toBe('Show slide 2');
  });

  it('pauses while the mouse is over it or focus is inside it', () => {
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    const region = screen.getByRole('region', { name: 'Leadership' });
    fireEvent.pointerEnter(region, { pointerType: 'mouse' });
    tick(HERO_INTERVAL_MS * 2);
    expect(currentDot()).toBe('Show slide 1');
    fireEvent.pointerLeave(region);
    fireEvent.focus(screen.getByRole('button', { name: 'Next slide' }));
    tick(HERO_INTERVAL_MS * 2);
    expect(currentDot()).toBe('Show slide 1');
  });

  it('starts paused when the user prefers reduced motion', () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeTruthy();
    tick(HERO_INTERVAL_MS * 3);
    expect(currentDot()).toBe('Show slide 1');
  });

  it('can still be moved by arrow keys, dots and swipe', () => {
    const { container } = render(<HeroCarousel label="Leadership" slides={slides} />);
    const region = screen.getByRole('region', { name: 'Leadership' });
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(currentDot()).toBe('Show slide 3');
    fireEvent.click(screen.getByRole('button', { name: 'Show slide 2' }));
    expect(currentDot()).toBe('Show slide 2');
    const area = container.querySelector('[data-swipe-area]') as HTMLElement;
    fireEvent.pointerDown(area, { clientX: 300 });
    fireEvent.pointerUp(area, { clientX: 200 });
    expect(currentDot()).toBe('Show slide 3');
  });

  it('keeps announcements quiet while rotating and polite when paused', () => {
    render(<HeroCarousel label="Leadership" slides={slides} />);
    const live = screen.getByText(/^Slide 1 of 3/);
    expect(live.getAttribute('aria-live')).toBe('off');
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(live.getAttribute('aria-live')).toBe('polite');
  });

  it('a single slide has no controls and no timer; zero slides render nothing', () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<HeroCarousel label="One" slides={slides.slice(0, 1)} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    unmount();
    const empty = render(<HeroCarousel label="None" slides={[]} />);
    expect(empty.container.innerHTML).toBe('');
    expect(container).toBeTruthy();
  });
});
