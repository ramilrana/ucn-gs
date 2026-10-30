import { showPending } from '../../lib/published';

/** Placeholder for content not yet supplied. Invisible in production builds. */
export function PendingNotice({ label }: { label: string }) {
  if (!showPending()) return null;
  return (
    <div role="note" className="rounded border border-dashed border-line bg-paper p-4 text-sm text-ink-muted">
      Pending: {label}
    </div>
  );
}
