import { isVisible, visible } from '../../lib/published';
import type { EvidenceGroup, Resource } from '../../types/content';

/** True when at least one group or extra resource would render on the current build. */
export function hasVisibleContent(groups: readonly EvidenceGroup[], extra: readonly Resource[]): boolean {
  return groups.some(isVisible) || visible(extra).length > 0;
}
