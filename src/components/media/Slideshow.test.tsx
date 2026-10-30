import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FALLBACK_IMAGE } from '../../lib/fallbackImage';
import type { ImageAsset } from '../../types/content';
import { Slideshow } from './Slideshow';

const slide = (n: number, extra: Partial<ImageAsset> = {}): ImageAsset => ({
  src: `/img/${n}.jpg`,
  srcSet: `/img/${n}-480.jpg 480w, /img/${n}.jpg 960w`,
  width: 960,
  height: 540,
  alt: `Slide image ${n}`,
  ...extra,
});
const slides = [slide(1, { caption: 'First caption' }), slide(2), slide(3)];

const carousel = () => screen.getByRole('region', { name: 'Campus' });
const visibleAlts = () =>
  screen.queryAllByRole('img').map((img) => img.getAttribute('alt'));

afterEach(() => {
  vi.useRealTimers();
});

describe('Slideshow', () => {
  it('shows only the first slide initially', () => {
    render(<Slideshow label="Campus" slides={slides} />);
    expect(carousel().getAttribute('aria-roledescription')).toBe('carousel');
    expect(visibleAlts()).toEqual(['Slide image 1']);
    const groups = carousel().querySelectorAll('[role="group"]');
    expect(groups).toHaveLength(3);
    expect(groups[0]?.getAttribute('aria-label')).toBe('1 of 3');
    expect(groups[0]?.getAttribute('aria-roledescription')).toBe('slide');
    expect(groups[0]?.hasAttribute('hidden')).toBe(false);
    expect(groups[1]?.hasAttribute('hidden')).toBe(true);
    expect(groups[2]?.hasAttribute('hidden')).toBe(true);
    expect(screen.getByText('First caption')).toBeTruthy();
  });

  it('declares responsive image attributes and eager/lazy loading', () => {
    render(<Slideshow label="Campus" slides={slides} />);
    const imgs = carousel().querySelectorAll('img');
    expect(imgs[0]?.getAttribute('loading')).toBe('eager');
    expect(imgs[1]?.getAttribute('loading')).toBe('lazy');
    expect(imgs[2]?.getAttribute('loading')).toBe('lazy');
    expect(imgs[0]?.getAttribute('sizes')).toBe('(min-width: 1024px) 960px, 100vw');
    expect(imgs[0]?.getAttribute('srcset')).toBe(slides[0]?.srcSet);
    expect(imgs[0]?.getAttribute('width')).toBe('960');
    expect(imgs[0]?.getAttribute('height')).toBe('540');
  });

  it('Next and ArrowRight advance and wrap', async () => {
    const user = userEvent.setup();
    render(<Slideshow label="Campus" slides={slides} />);
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(visibleAlts()).toEqual(['Slide image 2']);
    screen.getByRole('button', { name: 'Next slide' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(visibleAlts()).toEqual(['Slide image 3']);
    await user.keyboard('{ArrowRight}');
    expect(visibleAlts()).toEqual(['Slide image 1']);
    await user.keyboard('{ArrowLeft}');
    expect(visibleAlts()).toEqual(['Slide image 3']);
  });

  it('Previous from first goes to last', async () => {
    const user = userEvent.setup();
    render(<Slideshow label="Campus" slides={slides} />);
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(visibleAlts()).toEqual(['Slide image 3']);
  });

  it('announces the slide position', async () => {
    const user = userEvent.setup();
    render(<Slideshow label="Campus" slides={slides} />);
    const live = carousel().querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('Slide 1 of 3: Slide image 1');
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(live?.textContent).toBe('Slide 2 of 3: Slide image 2');
  });

  it('omits the colon part of the announcement when the slide has no alt text', () => {
    render(<Slideshow label="Campus" slides={[slide(1, { alt: '' }), slide(2)]} />);
    const live = carousel().querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('Slide 1 of 2');
  });

  it('ignores arrow keys held with a modifier so browser and screen reader shortcuts keep working', async () => {
    const user = userEvent.setup();
    render(<Slideshow label="Campus" slides={slides} />);
    screen.getByRole('button', { name: 'Next slide' }).focus();
    for (const modifier of ['Alt', 'Control', 'Meta', 'Shift']) {
      await user.keyboard(`{${modifier}>}{ArrowRight}{/${modifier}}`);
      expect(visibleAlts(), modifier).toEqual(['Slide image 1']);
    }
    await user.keyboard('{ArrowRight}');
    expect(visibleAlts()).toEqual(['Slide image 2']);
  });

  it('lets the image shrink to its own width so narrow images have no empty bars inside the border', () => {
    render(<Slideshow label="Campus" slides={slides} />);
    const cls = screen.getByRole('img', { name: 'Slide image 1' }).className;
    expect(cls).toContain('w-auto');
    expect(cls).toContain('max-w-full');
    expect(cls).not.toMatch(/(^|\s)w-full(\s|$)/);
    expect(cls).toContain('border');
  });

  it('dot click jumps and sets aria-current', async () => {
    const user = userEvent.setup();
    render(<Slideshow label="Campus" slides={slides} />);
    const dot1 = screen.getByRole('button', { name: 'Show slide 1' });
    expect(dot1.getAttribute('aria-current')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Show slide 3' }));
    expect(visibleAlts()).toEqual(['Slide image 3']);
    expect(screen.getByRole('button', { name: 'Show slide 3' }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('button', { name: 'Show slide 1' }).hasAttribute('aria-current')).toBe(false);
  });

  it('a horizontal swipe of more than 40px changes slide; a short one does not', () => {
    render(<Slideshow label="Campus" slides={slides} />);
    const area = carousel().querySelector('[data-swipe-area]');
    if (!area) throw new Error('swipe area missing');
    fireEvent.pointerDown(area, { clientX: 200, clientY: 10, pointerId: 1 });
    fireEvent.pointerUp(area, { clientX: 170, clientY: 10, pointerId: 1 });
    expect(visibleAlts()).toEqual(['Slide image 1']);
    fireEvent.pointerDown(area, { clientX: 200, clientY: 10, pointerId: 1 });
    fireEvent.pointerUp(area, { clientX: 100, clientY: 12, pointerId: 1 });
    expect(visibleAlts()).toEqual(['Slide image 2']);
    fireEvent.pointerDown(area, { clientX: 100, clientY: 10, pointerId: 1 });
    fireEvent.pointerUp(area, { clientX: 180, clientY: 10, pointerId: 1 });
    expect(visibleAlts()).toEqual(['Slide image 1']);
  });

  it('single slide hides controls', () => {
    render(<Slideshow label="Campus" slides={[slide(1)]} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(visibleAlts()).toEqual(['Slide image 1']);
  });

  it('zero slides renders nothing', () => {
    const { container } = render(<Slideshow label="Campus" slides={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('broken image swaps to the fallback', () => {
    render(<Slideshow label="Campus" slides={slides} />);
    const img = screen.getByRole('img', { name: 'Slide image 1' }) as HTMLImageElement;
    fireEvent.error(img);
    expect(img.src).toBe(FALLBACK_IMAGE);
    expect(img.hasAttribute('srcset')).toBe(false);
  });

  it('has no autoplay timer', () => {
    vi.useFakeTimers();
    render(<Slideshow label="Campus" slides={slides} />);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(visibleAlts()).toEqual(['Slide image 1']);
    expect(vi.getTimerCount()).toBe(0);
  });
});
