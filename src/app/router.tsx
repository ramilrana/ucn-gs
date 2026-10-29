import type { ComponentType } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { routeManifest, type RouteEntry, type RouteKind } from '../content/routes';
import { RootLayout } from './RootLayout';
import { RouteLoading } from './RouteLoading';

type PageModule = { default: ComponentType };

const pageLoaders: Record<RouteKind, () => Promise<PageModule>> = {
  home: () => import('../pages/HomePage'),
  'areas-index': () => import('../pages/AreasIndexPage'),
  area: () => import('../pages/AreaPage'),
  'compliance-index': () => import('../pages/ComplianceIndexPage'),
  recommendation: () => import('../pages/RecommendationPage'),
  avp: () => import('../pages/AvpPage'),
  certificate: () => import('../pages/CertificatePage'),
  'additional-files': () => import('../pages/AdditionalFilesPage'),
  about: () => import('../pages/AboutPage'),
  'about-people': () => import('../pages/PeoplePage'),
  'about-faculty': () => import('../pages/FacultyByDepartmentPage'),
  'about-faqs': () => import('../pages/FaqsLocationPage'),
  'content-status': () => import('../pages/ContentStatusPage'),
};

const lazyPage = (load: () => Promise<PageModule>): RouteObject['lazy'] =>
  async () => ({ Component: (await load()).default });

/** One root layout route with a child per manifest entry, and a final `*` route for the 404 page. */
export function buildRouteObjects(manifest: RouteEntry[]): RouteObject[] {
  const children: RouteObject[] = manifest.map((entry) => ({
    // '/' becomes the index route; every other path drops its leading slash.
    ...(entry.path === '/' ? { index: true as const } : { path: entry.path.replace(/^\//, '') }),
    handle: { entry },
    lazy: lazyPage(pageLoaders[entry.kind]),
  }));
  children.push({ path: '*', lazy: lazyPage(() => import('../pages/NotFoundPage')) });
  return [{ path: '/', Component: RootLayout, HydrateFallback: RouteLoading, children }];
}

export function createAppRouter() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  return createBrowserRouter(buildRouteObjects(routeManifest), { basename });
}
