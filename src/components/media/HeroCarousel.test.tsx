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
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes('reduce'),
        media: query,
        addEventListener: (_type: string, fn: (event: MediaQueryListEvent) => void) => listeners.push(fn),
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
  return (matches: boolean) =>
    act(() => {
      for (const fn of listeners) fn({ matches } as MediaQueryListEvent);
    });
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('HeroCarousel', () => {
  it('is a labelled full-width peek carousel that centres the current slide and dims the neighbours', () => {
    const { container } = render(<HeroCarousel label="Leadership" slides={slides} />);
    const region = screen.getByRole('region', { name: 'Leadership' });
    expect(region.className).toContain('w-full');
    const track = container.querySelector('[data-track]') as HTMLElement;
    expect(track.style.transform).toContain('0.5 * min(80%, 1056px)');
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(track.style.transform).toContain('1.5 * min(80%, 1056px)');
    const groups = Array.from(container.querySelectorAll('[aria-roledescription="slide"]'));
    expect(groups.map((g) => g.className.includes('opacity-40'))).toEqual([true, false, true]);
    expect(groups[1]?.className).toContain('max-w-[1056px]');
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
    const play = screen.getByRole('button', { name: 'Play slideshow' });
    play.focus();
    fireEvent.click(play);
    // Focus stays on the button, and Play still starts it (APG: the rotation control overrides the focus pause).
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Pause slideshow');
    tick(HERO_INTERVAL_MS);
    expect(currentDot()).toBe('Show slide 2');
  });

  it('the rotation control is the first button, before Previous', () => {
    render(<HeroCarousel label="Leadership" slides={slides} />);
    const names = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));
    expect(names.slice(0, 2)).toEqual(['Pause slideshow', 'Previous slide']);
  });

  it('pauses while the mouse is over it, and Play overrides that', () => {
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    const region = screen.getByRole('region', { name: 'Leadership' });
    fireEvent.pointerEnter(region, { pointerType: 'mouse' });
    tick(HERO_INTERVAL_MS * 2);
    expect(currentDot()).toBe('Show slide 1');
    fireEvent.pointerLeave(region);
    tick(HERO_INTERVAL_MS);
    expect(currentDot()).toBe('Show slide 2');
    // Pause and Play again with the mouse still over it: it runs.
    fireEvent.pointerEnter(region, { pointerType: 'mouse' });
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play slideshow' }));
    tick(HERO_INTERVAL_MS);
    expect(currentDot()).toBe('Show slide 3');
  });

  it('keyboard focus entering it stops rotation until Play is pressed, even after focus leaves', () => {
    vi.useFakeTimers();
    render(
      <>
        <button type="button">Before</button>
        <HeroCarousel label="Leadership" slides={slides} />
        <button type="button">After</button>
      </>,
    );
    const before = screen.getByRole('button', { name: 'Before' });
    const rotation = screen.getByRole('button', { name: 'Pause slideshow' });
    fireEvent.keyDown(before, { key: 'Tab' });
    fireEvent.focus(rotation, { relatedTarget: before });
    expect(rotation.getAttribute('aria-label')).toBe('Play slideshow');
    fireEvent.blur(rotation, { relatedTarget: screen.getByRole('button', { name: 'After' }) });
    tick(HERO_INTERVAL_MS * 2);
    expect(currentDot()).toBe('Show slide 1');
  });

  it('focus moved in by a tap (Android: focus after pointerup) or a click does not stop rotation', () => {
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    const next = screen.getByRole('button', { name: 'Next slide' });
    fireEvent.pointerDown(next, { pointerType: 'touch' });
    fireEvent.pointerUp(next, { pointerType: 'touch' });
    fireEvent.mouseDown(next);
    fireEvent.focus(next);
    fireEvent.click(next);
    expect(currentDot()).toBe('Show slide 2');
    tick(HERO_INTERVAL_MS);
    expect(currentDot()).toBe('Show slide 3');
    // Returning to the window (Alt-Tab) refocuses the button (relatedTarget null): still not a keyboard entry.
    fireEvent.blur(next);
    fireEvent.keyDown(window, { key: 'Alt', altKey: true });
    fireEvent.focus(next);
    expect(screen.getByRole('button', { name: 'Pause slideshow' })).toBeTruthy();
  });

  it('a tap followed later by keyboard entry does pause', () => {
    render(
      <>
        <button type="button">Before</button>
        <HeroCarousel label="Leadership" slides={slides} />
      </>,
    );
    const before = screen.getByRole('button', { name: 'Before' });
    const next = screen.getByRole('button', { name: 'Next slide' });
    fireEvent.pointerDown(next, { pointerType: 'touch' });
    fireEvent.pointerUp(next, { pointerType: 'touch' });
    fireEvent.focus(next);
    fireEvent.blur(next, { relatedTarget: before });
    fireEvent.keyDown(before, { key: 'Tab' });
    fireEvent.focus(next, { relatedTarget: before });
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeTruthy();
  });

  it('starts paused when the user prefers reduced motion', () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeTruthy();
    tick(HERO_INTERVAL_MS * 3);
    expect(currentDot()).toBe('Show slide 1');
  });

  it('pauses when reduced motion is switched on while the page is open', () => {
    const change = setReducedMotion(false);
    vi.useFakeTimers();
    render(<HeroCarousel label="Leadership" slides={slides} />);
    change(true);
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeTruthy();
    tick(HERO_INTERVAL_MS * 2);
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
