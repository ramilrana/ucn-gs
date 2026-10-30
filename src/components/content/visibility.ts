import { isVisible, showPending, visible } from '../../lib/published';
import type { EvidenceBlock, EvidenceGroup, Resource } from '../../types/content';

const resourceRenders = (resource: Resource): boolean =>
  isVisible(resource) && (resource.source !== undefined || showPending());

/** True when the block would render something on the current build. */
export function blockHasVisibleContent(block: EvidenceBlock): boolean {
  switch (block.type) {
    case 'text':
      return block.paragraphs.length > 0;
    case 'document':
    case 'video':
      return resourceRenders(block.resource);
    case 'resources':
      return visible(block.items).length > 0;
    case 'gallery':
      return block.images.length > 0;
    default: {
      const unhandled: never = block;
      // Unreachable by type; bad runtime data counts as nothing to show.
      void unhandled;
      return false;
    }
  }
}

/** A visible group that has something to show (or, outside production, a pending notice). */
export function groupHasVisibleContent(group: EvidenceGroup): boolean {
  return isVisible(group) && (group.blocks.some(blockHasVisibleContent) || showPending());
}

/** True when at least one group or extra resource would render on the current build. */
export function hasVisibleContent(groups: readonly EvidenceGroup[], extra: readonly Resource[]): boolean {
  return groups.some(groupHasVisibleContent) || visible(extra).length > 0;
}
