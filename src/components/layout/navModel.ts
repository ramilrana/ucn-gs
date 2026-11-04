import type { RouteEntry, RouteKind } from '../../content/routes';

export interface NavChild {
  label: string;
  path: string;
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavChild[];
}

const toChild = (entry: RouteEntry): NavChild => ({ label: entry.title, path: entry.path });

/** A group keeps its own link; `children` is present only when there is something to list. */
function group(label: string, path: string, children: NavChild[]): NavItem {
  return children.length > 0 ? { label, path, children } : { label, path };
}

/**
 * The six top-level header items, in order. A group with no visible pages (for example
 * every area still pending in production) keeps its index link and drops `children`,
 * so the menu never shows an empty dropdown.
 */
export function buildNavModel(manifest: readonly RouteEntry[], areasLabel: string): NavItem[] {
  const ofKind = (...kinds: RouteKind[]) => manifest.filter((entry) => kinds.includes(entry.kind));
  const pathOf = (kind: RouteKind, fallback: string) => ofKind(kind)[0]?.path ?? fallback;

  const recommendations = ofKind('recommendation').sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  return [
    group('Home', pathOf('home', '/'), []),
    group(areasLabel, pathOf('areas-index', '/accreditation-areas'), ofKind('area').map(toChild)),
    group('Compliance Report', pathOf('compliance-index', '/compliance-report'), recommendations.map(toChild)),
    group('AVP', pathOf('avp', '/avp'), []),
    group(
      'Documents',
      pathOf('certificate', '/certificate-of-authenticity'),
      ofKind('certificate', 'additional-files').map(toChild),
    ),
    group('About', pathOf('about', '/about'), ofKind('about', 'about-people', 'about-faculty', 'about-faqs').map(toChild)),
  ];
}

/** Strips one trailing slash so `/about/` and `/about` compare equal. */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

/** True on the item's own page, on any child page, or below its path. Home matches only exactly. */
export function isActive(item: NavItem, pathname: string): boolean {
  const current = normalizePath(pathname);
  if (current === item.path) return true;
  if (item.path === '/') return false;
  if (item.children?.some((child) => child.path === current)) return true;
  return current.startsWith(`${item.path}/`);
}

/** `aria-current` for a top-level item: "page" on its own page, "true" for an ancestor of the current page. */
export function currentFor(item: NavItem, pathname: string): 'page' | 'true' | undefined {
  if (normalizePath(pathname) === item.path) return 'page';
  return isActive(item, pathname) ? 'true' : undefined;
}
