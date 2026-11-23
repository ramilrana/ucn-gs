import type { Recommendation } from '../types/content';

/**
 * True while a recommendation still has the placeholder title "Recommendation N" (real titles are still to come).
 * Views then show only "Recommendation N" instead of repeating it after the number or under the banner.
 */
export const hasPlaceholderTitle = (rec: Pick<Recommendation, 'title' | 'number'>): boolean =>
  rec.title === `Recommendation ${rec.number}`;
