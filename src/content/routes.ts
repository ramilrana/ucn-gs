import type { Area, Recommendation } from '../types/content';
import { showPending } from '../lib/published';
import { areas, recommendations } from './index';
import staticRoutes from './static-routes.json';

export type RouteKind =
  | 'home'
  | 'areas-index'
  | 'area'
  | 'compliance-index'
  | 'recommendation'
  | 'avp'
  | 'certificate'
  | 'additional-files'
  | 'about'
  | 'about-people'
  | 'about-faculty'
  | 'about-faqs'
  | 'content-status';

export interface RouteEntry {
  path: string;
  title: string;
  kind: RouteKind;
  parentPath?: string;
  slug?: string;
  number?: number;
  devOnly?: boolean;
}

interface StaticRoute {
  path: string;
  title: string;
  kind: RouteKind;
}

const ABOUT_PATH = '/about';
const AREAS_PATH = '/accreditation-areas';
const COMPLIANCE_PATH = '/compliance-report';

const ABOUT_CHILDREN: ReadonlySet<RouteKind> = new Set(['about-people', 'about-faculty', 'about-faqs']);

export interface RouteManifestInput {
  areas: readonly Area[];
  recommendations: readonly Recommendation[];
  includePending: boolean;
}

/**
 * Every client route, in nav order: the static routes, then one per visible area and
 * recommendation, then the dev-only content status page.
 */
export function buildRouteManifest({ areas: areaList, recommendations: recList, includePending }: RouteManifestInput): RouteEntry[] {
  const keep = <T extends { status: Area['status'] }>(items: readonly T[]): T[] =>
    includePending ? [...items] : items.filter((item) => item.status === 'published');

  const entries: RouteEntry[] = (staticRoutes as StaticRoute[]).map((route) =>
    ABOUT_CHILDREN.has(route.kind) ? { ...route, parentPath: ABOUT_PATH } : { ...route },
  );

  for (const area of keep(areaList)) {
    entries.push({
      path: `${AREAS_PATH}/${area.slug}`,
      title: area.title,
      kind: 'area',
      parentPath: AREAS_PATH,
      slug: area.slug,
    });
  }

  for (const rec of keep(recList)) {
    entries.push({
      path: `${COMPLIANCE_PATH}/recommendation-${rec.number}`,
      title: `Recommendation ${rec.number}`,
      kind: 'recommendation',
      parentPath: COMPLIANCE_PATH,
      number: rec.number,
    });
  }

  if (includePending) {
    entries.push({ path: '/content-status', title: 'Content status', kind: 'content-status', devOnly: true });
  }

  return entries;
}

export const routeManifest: RouteEntry[] = buildRouteManifest({
  areas,
  recommendations,
  includePending: showPending(),
});
