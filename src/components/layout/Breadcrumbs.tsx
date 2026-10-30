import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRouteEntry } from '../../app/useRouteEntry';
import { routeManifest, type RouteEntry } from '../../content/routes';
import { buildCrumbs } from './crumbs';

interface BreadcrumbsProps {
  /** Defaults to the app manifest; tests pass a fixture. */
  manifest?: readonly RouteEntry[];
}

/** The trail from Home to the current page. Renders nothing on Home or on a route without a manifest entry. */
export function Breadcrumbs({ manifest = routeManifest }: BreadcrumbsProps) {
  const entry = useRouteEntry();
  if (!entry || entry.path === '/') return null;

  const crumbs = buildCrumbs(entry, manifest);
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-ink-muted">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {crumb.path !== undefined ? (
              <Link
                to={crumb.path}
                className="inline-flex min-h-11 items-center rounded text-maroon-800 underline underline-offset-2 hover:text-maroon-900"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {crumb.label}
              </span>
            )}
            {index < crumbs.length - 1 && <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
