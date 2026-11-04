import { formatLabels } from '../../lib/resourceFormat';
import type { ResourceFormat } from '../../types/content';

/** Format label as text, never color alone. */
export function Badge({ format }: { format: ResourceFormat }) {
  return (
    <span className="inline-flex items-center rounded border border-line bg-paper px-2 py-0.5 text-xs font-semibold text-ink-muted">
      {formatLabels[format]}
    </span>
  );
}
