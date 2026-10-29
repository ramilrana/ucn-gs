import type { ImageAsset } from '../types/content';
import type { Picture } from '../types/picture';

/**
 * Query string editors append when importing a photo so vite-imagetools emits
 * responsive WebP variants: `import photo from './photo.jpg?w=480;960;1600&format=webp&as=picture'`.
 */
export const PHOTO_QUERY = '?w=480;960;1600&format=webp&as=picture';

/** Maps vite-imagetools `as=picture` output to an ImageAsset. `srcSet` is the first source's value. */
export function toImageAsset(picture: Picture, alt: string, caption?: string): ImageAsset {
  const srcSet = Object.values(picture.sources)[0];
  return {
    src: picture.img.src,
    ...(srcSet !== undefined ? { srcSet } : {}),
    width: picture.img.w,
    height: picture.img.h,
    alt,
    ...(caption !== undefined ? { caption } : {}),
  };
}
