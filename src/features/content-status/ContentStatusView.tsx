import { ActionLink } from '../../components/ui/ActionLink';
import type { PendingEntry } from './collectPending';

/** Checklist of everything still pending, with a link to the page each item belongs to. */
export function ContentStatusView({ entries }: { entries: readonly PendingEntry[] }) {
  return (
    <>
      <p className="mb-6 max-w-[70ch] text-ink-muted">
        This page is for the editing team. It exists only in dev and preview builds and lists what UCN still has to supply.
      </p>
      <p className="mb-4 font-semibold" aria-live="polite">
        Total pending: {entries.length}
      </p>
      {entries.length === 0 ? (
        <p>Nothing is pending.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Pending content by page</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-3 py-2 font-semibold">Page</th>
                <th scope="col" className="px-3 py-2 font-semibold">Item</th>
                <th scope="col" className="px-3 py-2 font-semibold">Link to page</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={`${entry.path}|${entry.label}|${i}`} className="border-b border-line align-top">
                  <td className="px-3 py-2 break-words">{entry.page}</td>
                  <td className="px-3 py-2 break-words">{entry.label}</td>
                  <td className="px-3 py-2 break-all">
                    <ActionLink href={entry.path}>{entry.path}</ActionLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
