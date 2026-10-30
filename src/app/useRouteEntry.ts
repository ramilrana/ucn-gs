import { useMatches } from 'react-router-dom';
import type { RouteEntry } from '../content/routes';

function isRouteEntry(value: unknown): value is RouteEntry {
  return typeof value === 'object' && value !== null && 'path' in value && 'kind' in value;
}

/** The manifest entry of the deepest matched route, or undefined (for example on the 404 route). */
export function useRouteEntry(): RouteEntry | undefined {
  const matches = useMatches();
  const handle = matches.at(-1)?.handle;
  const entry = typeof handle === 'object' && handle !== null && 'entry' in handle ? handle.entry : undefined;
  return isRouteEntry(entry) ? entry : undefined;
}
