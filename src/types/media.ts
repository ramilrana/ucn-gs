export const MEDIA_CATEGORIES = ['research', 'events', 'people', 'facilities'] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

interface BaseMedia {
  id: string;
  title: string;
  description?: string;
  category: MediaCategory;
}

export interface ImageItem extends BaseMedia {
  type: 'image';
  src: string;
  thumbnail?: string;
  alt: string;
  width: number;
  height: number;
  /** Featured images appear on the home page. */
  featured?: boolean;
}

export interface VideoItem extends BaseMedia {
  type: 'video';
  src: string;
  poster: string;
  captions?: string; // .vtt file
}

export type MediaItem = ImageItem | VideoItem;
