import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FALLBACK_IMAGE } from '../../lib/fallbackImage';
import type { ImageAsset } from '../../types/content';
import { ImageGallery } from './ImageGallery';

const image = (n: number, extra: Partial<ImageAsset> = {}): ImageAsset => ({
  src: `/img/${n}.jpg`,
  srcSet: `/img/${n}-480.jpg 480w, /img/${n}.jpg 960w`,
  width: 800,
  height: 600,
  alt: `Photo ${n}`,
  ...extra,
});
const images = [image(1, { caption: 'Caption one' }), image(2), image(3, { alt: '', caption: 'Only caption' })];
const many = (n: number) => Array.from({ length: n }, (_, i) => image(i + 1));

const thumb = (i: number): HTMLElement => {
  const el = thumbs()[i];
  if (!el) throw new Error(`no thumbnail at ${i}`);
  return el;
};
const thumbs = () => screen.getAllByRole('button', { name: /^View image:/ });
const dialog = () => screen.getByRole('dialog', { name: 'Gallery' });

/**
 * jsdom has no native Esc handling. Pressing Esc in a browser fires `cancel` and, unless that is
 * prevented, closes the dialog (which fires `close`). We reproduce exactly that sequence.
 */
function pressEscape(el: HTMLElement) {
  act(() => {
    const cancel = new Event('cancel', { cancelable: true });
    el.dispatchEvent(cancel);
    if (!cancel.defaultPrevented) (el as HTMLDialogElement).close();
  });
}

describe('ImageGallery', () => {
  it('renders lazy thumbnail buttons named after alt, then caption, then position', () => {
    render(<ImageGallery label="Gallery" images={images} />);
    const names = thumbs().map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(['View image: Photo 1', 'View image: Photo 2', 'View image: Only caption']);
    const noText = render(<ImageGallery label="Other" images={[image(9, { alt: '' })]} />);
    expect(within(noText.container).getByRole('button', { name: 'View image: Image 1' })).toBeTruthy();
    const img = thumbs()[0]?.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('width')).toBe('800');
    expect(img?.className).toContain('aspect-[4/3]');
    expect(img?.className).toContain('object-cover');
  });

  it('opens the dialog on the clicked image', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={images} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(thumb(0));
    const d = dialog();
    expect(within(d).getByRole('img', { name: 'Photo 1' })).toBeTruthy();
    expect(within(d).getByText('Caption one')).toBeTruthy();
    expect(within(d).getByText('1 of 3')).toBeTruthy();
    expect(within(d).getByRole('button', { name: 'Previous image' })).toBeTruthy();
    expect(within(d).getByRole('button', { name: 'Next image' })).toBeTruthy();
    expect(within(d).getByRole('button', { name: 'Close' })).toBeTruthy();
    expect(within(d).getByRole('img', { name: 'Photo 1' }).className).toContain('object-contain');
  });

  it('opens on the second image when it is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={images} />);
    await user.click(thumb(1));
    expect(within(dialog()).getByText('2 of 3')).toBeTruthy();
  });

  it('ArrowRight shows the next image; Next and ArrowLeft wrap', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={images} />);
    await user.click(thumb(0));
    await user.keyboard('{ArrowRight}');
    expect(within(dialog()).getByRole('img', { name: 'Photo 2' })).toBeTruthy();
    expect(within(dialog()).getByText('2 of 3')).toBeTruthy();
    await user.click(within(dialog()).getByRole('button', { name: 'Next image' }));
    expect(within(dialog()).getByText('3 of 3')).toBeTruthy();
    await user.click(within(dialog()).getByRole('button', { name: 'Next image' }));
    expect(within(dialog()).getByText('1 of 3')).toBeTruthy();
    await user.keyboard('{ArrowLeft}');
    expect(within(dialog()).getByText('3 of 3')).toBeTruthy();
  });

  it('close returns focus to the opener', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={images} />);
    const opener = thumb(1);
    await user.click(opener);
    await user.click(within(dialog()).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('Esc (simulated cancel then close) closes the dialog and returns focus to the opener', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={images} />);
    const opener = thumb(2);
    await user.click(opener);
    // Even after navigating inside the viewer, focus goes back to the thumbnail that opened it.
    await user.keyboard('{ArrowRight}');
    pressEscape(dialog());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('a backdrop click (the dialog element itself) closes the viewer', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={images} />);
    await user.click(thumb(0));
    fireEvent.click(dialog());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('a single image has no Previous/Next buttons', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={[image(1)]} />);
    await user.click(thumb(0));
    expect(within(dialog()).queryByRole('button', { name: 'Next image' })).toBeNull();
    expect(within(dialog()).queryByRole('button', { name: 'Previous image' })).toBeNull();
    expect(within(dialog()).getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('broken thumbnail and viewer images swap to the fallback', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={images} />);
    const thumbImg = thumb(0).querySelector('img') as HTMLImageElement;
    fireEvent.error(thumbImg);
    expect(thumbImg.src).toBe(FALLBACK_IMAGE);
    await user.click(thumb(1));
    const big = within(dialog()).getByRole('img', { name: 'Photo 2' }) as HTMLImageElement;
    fireEvent.error(big);
    expect(big.src).toBe(FALLBACK_IMAGE);
  });

  it('initially renders 24 of 30 thumbnails and expands', async () => {
    const user = userEvent.setup();
    render(<ImageGallery label="Gallery" images={many(30)} />);
    expect(thumbs()).toHaveLength(24);
    await user.click(screen.getByRole('button', { name: 'Show all 30 photos' }));
    expect(thumbs()).toHaveLength(30);
    expect(screen.queryByRole('button', { name: /Show all/ })).toBeNull();
    // The button that had focus is gone; focus lands on the first newly revealed thumbnail.
    expect(document.activeElement).toBe(thumb(24));
  });

  it('exactly 24 images show no expand button', () => {
    render(<ImageGallery label="Gallery" images={many(24)} />);
    expect(thumbs()).toHaveLength(24);
    expect(screen.queryByRole('button', { name: /Show all/ })).toBeNull();
  });

  it('empty images renders nothing', () => {
    const { container } = render(<ImageGallery label="Gallery" images={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
