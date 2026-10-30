import type { ResourceFormat } from '../types/content';

/** Human labels for each resource format. Shared by Badge and the iframe titles so they never disagree. */
export const formatLabels: Record<ResourceFormat, string> = {
  pdf: 'PDF',
  video: 'Video',
  folder: 'Folder',
  doc: 'Doc',
  link: 'Link',
  image: 'Image',
};
