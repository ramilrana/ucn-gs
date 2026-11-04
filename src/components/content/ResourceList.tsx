import { visible } from '../../lib/published';
import type { Resource } from '../../types/content';
import { ResourceRow } from './ResourceRow';

/** A list of the visible resources, or nothing when there are none. */
export function ResourceList({ items, label }: { items: readonly Resource[]; label?: string }) {
  const rows = visible(items);
  if (rows.length === 0) return null;
  return (
    <ul aria-label={label} className="divide-y divide-line">
      {rows.map((resource) => (
        <ResourceRow key={resource.id} resource={resource} />
      ))}
    </ul>
  );
}
