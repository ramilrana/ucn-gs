import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { normalizePath } from './navModel';

export interface PagerItem {
  title: string;
  path: string;
}

interface PagerProps {
  items: readonly PagerItem[];
  currentPath: string;
}

const linkClass =
  'group flex min-h-11 max-w-full flex-col gap-1 rounded border border-line px-4 py-3 text-maroon-800 transition-colors duration-150 hover:bg-paper hover:text-maroon-900 sm:max-w-[48%]';

/** Previous and next links within an ordered list of pages. Nothing for a single page or an unknown current page. */
export function Pager({ items, currentPath }: PagerProps) {
  const current = normalizePath(currentPath);
  const index = items.findIndex((item) => item.path === current);
  if (items.length < 2 || index === -1) return null;

  const previous = items[index - 1];
  const next = items[index + 1];
  return (
    <nav aria-label="Pager" className="flex flex-wrap justify-between gap-4 border-t border-line pt-6">
      {previous && (
        <Link to={previous.path} aria-label={`Previous: ${previous.title}`} className={linkClass}>
          <span className="flex items-center gap-1 text-sm text-ink-muted">
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </span>
          <span className="font-serif text-lg font-semibold">{previous.title}</span>
        </Link>
      )}
      {next && (
        <Link to={next.path} aria-label={`Next: ${next.title}`} className={`${linkClass} ml-auto text-right`}>
          <span className="flex items-center justify-end gap-1 text-sm text-ink-muted">
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </span>
          <span className="font-serif text-lg font-semibold">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
