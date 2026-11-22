import type { RouteEntry, RouteKind } from '../../content/routes';

export interface NavChild {
  label: string;
  path: string;
  /** Visually hidden word(s), added after a space, appended to the link's accessible name, to tell it apart from a same-named link. */
  srSuffix?: string;
  /** A third level (the Compliance Report's recommendations under each area). */
  children?: NavChild[];
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavChild[];
}

const COMPLIANCE_PATH = '/compliance-report';

const toChild = (entry: RouteEntry): NavChild => ({
  label: entry.title,
  path: entry.path,
});

/** A group keeps its own link; `children` is present only when there is something to list. */
function group(label: string, path: string, children: NavChild[]): NavItem {
  return children.length > 0 ? { label, path, children } : { label, path };
}

/**
 * The six top-level header items, in order (user's order, 2026-11-20): Home, Certificate of Authenticity, Compliance
 * Report, the areas, AVP, About. A group with no visible pages (for example
 * every area still pending in production) keeps its index link and drops `children`,
 * so the menu never shows an empty dropdown.
 */
export function buildNavModel(manifest: readonly RouteEntry[], areasLabel: string): NavItem[] {
  const ofKind = (...kinds: RouteKind[]) => manifest.filter((entry) => kinds.includes(entry.kind));
  const pathOf = (kind: RouteKind, fallback: string) => ofKind(kind)[0]?.path ?? fallback;

  // One anchor per area that has recommendations, in manifest (area) order. The index page owns the
  // `#<slug>` sections, so these links stay on that page and never match a pathname. Each area lists its
  // recommendation pages as a third level (user's request 2026-11-22), as many as the area has.
  const areaTitles = new Map(ofKind('area').map((entry) => [entry.slug, entry.title]));
  const recommendations = ofKind('recommendation');
  const complianceAreas = [...new Set(recommendations.map((entry) => entry.slug))].flatMap((slug): NavChild[] => {
    if (slug === undefined) return [];
    const areaTitle = areaTitles.get(slug) ?? slug;
    return [
      {
        label: areaTitle,
        path: `${COMPLIANCE_PATH}#${slug}`,
        srSuffix: 'recommendations',
        children: recommendations
          .filter((entry) => entry.slug === slug)
          .map((entry) => ({
            label: `Recommendation ${entry.number ?? ''}`.trim(),
            path: entry.path,
            // "Recommendation 1" repeats across areas; the area tells the links apart for screen readers.
            srSuffix: `(${areaTitle})`,
          })),
      },
    ];
  });

  return [
    group('Home', pathOf('home', '/'), []),
    group('Certificate of Authenticity', pathOf('certificate', '/certificate-of-authenticity'), []),
    group('Compliance Report', pathOf('compliance-index', '/compliance-report'), complianceAreas),
    group(areasLabel, pathOf('areas-index', '/accreditation-areas'), ofKind('area').map(toChild)),
    group('AVP', pathOf('avp', '/avp'), []),
    group(
      'About',
      pathOf('about', '/about'),
      ofKind('about', 'about-people', 'about-faculty', 'about-faqs').map(toChild),
    ),
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
  if (item.children?.some((child) => child.path === current || child.children?.some((c) => c.path === current))) return true;
  return current.startsWith(`${item.path}/`);
}

/** `aria-current` for a top-level item: "page" on its own page, "true" for an ancestor of the current page. */
export function currentFor(item: NavItem, pathname: string): 'page' | 'true' | undefined {
  if (normalizePath(pathname) === item.path) return 'page';
  return isActive(item, pathname) ? 'true' : undefined;
}
