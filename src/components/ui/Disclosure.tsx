import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Native <details>: keyboard and screen reader behavior come from the browser. */
export function Disclosure({ summary, children, defaultOpen = false }: DisclosureProps) {
  return (
    <details className="group border-b border-line" open={defaultOpen || undefined}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 font-medium text-ink [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 shrink-0 text-maroon-800 transition-transform duration-150 group-open:rotate-180 motion-reduce:group-open:rotate-0"
        />
      </summary>
      <div className="pb-4 text-ink">{children}</div>
    </details>
  );
}
