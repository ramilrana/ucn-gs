// Pure helpers for the live link checker (`npm run check:links`, scripts/links.live.test.ts).
// Nothing here touches the network.
import { collectPublishedResources } from '../content/validate';
import { viewUrl } from './resourceUrls';

export type LinkKind = 'drive' | 'drive-folder' | 'youtube' | 'external';
export type LinkResult = 'ok' | 'not-public' | 'redirect' | 'broken';

export interface LinkTarget {
  url: string;
  /** Where the link lives in the content, for the failure table. */
  where: string;
  kind: LinkKind;
}

export interface CheckedLink extends LinkTarget {
  result: LinkResult;
  /** HTTP status, or 0 when the request failed or timed out. */
  status: number;
  /** Network error or timeout text, when there was no response. */
  detail?: string;
}

/**
 * Remote sources of published content, using viewUrl for each (the page a visitor lands on).
 * Local files, pending items (and everything inside a pending area, group, person or slot),
 * sources without a safe URL, and `DEV-SAMPLE-` ids (their Drive id is fake) are skipped.
 */
export function collectLinkTargets(content: unknown): LinkTarget[] {
  const seen = new Set<string>();
  const targets: LinkTarget[] = [];
  for (const resource of collectPublishedResources(content)) {
    if (resource.id.startsWith('DEV-SAMPLE-')) continue;
    const source = resource.source;
    if (!source || source.kind === 'local') continue;
    const url = viewUrl(source);
    if (url === null) continue;
    const key = `${resource.id}\n${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ url, where: `resource "${resource.id}" (${resource.title})`, kind: source.kind });
  }
  return targets;
}

/** A redirect to the Google sign-in page means the file exists but is not shared publicly. */
function isSignInRedirect(location: string): boolean {
  if (location.toLowerCase().includes('servicelogin')) return true;
  try {
    return new URL(location, 'https://placeholder.invalid').hostname.toLowerCase() === 'accounts.google.com';
  } catch {
    return false;
  }
}

/**
 * Classifies a response fetched with `redirect: 'manual'`.
 * - 2xx: ok
 * - 3xx to Google sign-in: not-public (the embed would show a sign-in page)
 * - other 3xx: redirect (reported, not a failure)
 * - anything else: broken
 */
export function classifyResponse(status: number, location: string | null): LinkResult {
  if (status >= 200 && status < 300) return 'ok';
  if (status >= 300 && status < 400) {
    return location !== null && isSignInRedirect(location) ? 'not-public' : 'redirect';
  }
  return 'broken';
}

/** Plain-text table of checked links, one row per link, for test output. */
export function formatLinkReport(rows: readonly CheckedLink[]): string {
  const lines = rows.map((row) => {
    const status = row.status === 0 ? 'no response' : String(row.status);
    const detail = row.detail ? ` (${row.detail})` : '';
    return `${row.result.padEnd(10)}  ${status.padEnd(11)}  ${row.where}\n${' '.repeat(25)}${row.url}${detail}`;
  });
  return ['result      status       where / url', ...lines].join('\n');
}
