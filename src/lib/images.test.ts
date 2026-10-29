import { expect, it } from 'vitest';
import { PHOTO_QUERY, toImageAsset } from './images';
import type { Picture } from '../types/picture';

it('toImageAsset maps picture output', () => {
  const picture: Picture = {
    sources: { webp: '/assets/a-480.webp 480w, /assets/a-960.webp 960w' },
    img: { src: '/assets/a-960.jpg', w: 960, h: 640 },
  };
  expect(toImageAsset(picture, 'Alt text', 'A caption')).toEqual({
    src: '/assets/a-960.jpg',
    srcSet: '/assets/a-480.webp 480w, /assets/a-960.webp 960w',
    width: 960,
    height: 640,
    alt: 'Alt text',
    caption: 'A caption',
  });
});

it('toImageAsset omits srcSet and caption when absent', () => {
  const asset = toImageAsset({ sources: {}, img: { src: '/a.jpg', w: 1, h: 2 } }, 'x');
  expect(asset).toEqual({ src: '/a.jpg', width: 1, height: 2, alt: 'x' });
});

it('documents the photo query convention', () => {
  expect(PHOTO_QUERY).toBe('?w=480;960;1600&format=webp&as=picture');
});
