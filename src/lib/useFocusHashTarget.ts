import { useEffect } from 'react';

/**
 * Moves focus to the h2 inside the element whose id the URL hash names, and scrolls it into view.
 * Only ids in `allowedIds` are targets; other ids on the page (such as #main) are ignored, and a
 * malformed hash such as "#%" is simply "no target".
 *
 * It waits one task so it runs after RootLayout's own focus on the page h1: that focus is set in a
 * layout effect that follows this component's effect (children first), or in a MutationObserver
 * callback when the page loads lazily. Either way a timer queued from here fires later, so the
 * hash target wins.
 */
export function useFocusHashTarget(hash: string, allowedIds: readonly string[]): void {
  const idKey = JSON.stringify(allowedIds);
  useEffect(() => {
    if (hash.length < 2) return;
    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    if (!(JSON.parse(idKey) as string[]).includes(id)) return;
    const timer = window.setTimeout(() => {
      const heading = document.getElementById(id)?.querySelector('h2');
      if (!heading) return;
      heading.focus({ preventScroll: true });
      if (typeof heading.scrollIntoView === 'function') {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        heading.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hash, idKey]);
}
