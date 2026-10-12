import { MEDIA_CATEGORIES, type MediaCategory } from '../../types/media';

export type CategoryFilter = MediaCategory | 'all';

export const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  research: 'Research',
  events: 'Events',
  people: 'People',
  facilities: 'Facilities',
};

export const CATEGORY_FILTERS: readonly CategoryFilter[] = ['all', ...MEDIA_CATEGORIES];

export function isCategoryFilter(value: unknown): value is CategoryFilter {
  return typeof value === 'string' && (CATEGORY_FILTERS as readonly string[]).includes(value);
}
