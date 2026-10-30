import type { RouteEntry } from '../../content/routes';

export interface Crumb {
  label: string;
  /** Absent on the current page, which is not a link. */
  path?: string;
}

const HOME_PATH = '/';

/** Home, then each ancestor (following `parentPath`), then the current page without a path. */
export function buildCrumbs(entry: RouteEntry, manifest: readonly RouteEntry[]): Crumb[] {
  if (entry.path === HOME_PATH) return [{ label: 'Home' }];

  const ancestors: Crumb[] = [];
  const seen = new Set<string>([entry.path]);
  let parentPath = entry.parentPath;
  while (parentPath !== undefined && !seen.has(parentPath)) {
    seen.add(parentPath);
    const parent = manifest.find((candidate) => candidate.path === parentPath);
    if (!parent) break;
    ancestors.unshift({ label: parent.title, path: parent.path });
    parentPath = parent.parentPath;
  }

  return [{ label: 'Home', path: HOME_PATH }, ...ancestors, { label: entry.title }];
}
