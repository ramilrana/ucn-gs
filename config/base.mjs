// Base path helpers shared by vite.config.ts and the Node build scripts.

/**
 * Normalizes a deployment base path: "/" for empty input, otherwise exactly
 * one leading and one trailing slash ("gs", "/gs", "//gs//" all give "/gs/").
 *
 * @param {string | undefined} [input]
 * @returns {string}
 */
export function normalizeBase(input) {
  const segments = String(input ?? '')
    .trim()
    .split('/')
    .filter(Boolean);
  for (const segment of segments) {
    if (!/^[A-Za-z0-9._~-]+$/.test(segment) || segment === '.' || segment === '..') {
      throw new Error(`Invalid VITE_BASE_PATH segment "${segment}". Use letters, digits, "-", "_" or "." only.`);
    }
  }
  return segments.length === 0 ? '/' : `/${segments.join('/')}/`;
}

/**
 * Reads the deployment base from a built index.html: the part of the first
 * module script's src before "assets/" (for example "/gs/assets/index-a.js" gives "/gs/").
 *
 * @param {string} html
 * @returns {string | null} the base, or null when it cannot be determined
 */
export function baseFromIndexHtml(html) {
  const tag = /<script\b[^>]*\btype="module"[^>]*>/i.exec(html)?.[0];
  const src = tag ? /\bsrc="([^"]+)"/i.exec(tag)?.[1] : undefined;
  if (!src) return null;
  // Last "/assets/": the base itself may contain "assets" (for example "/ucn-assets/").
  const at = src.lastIndexOf('/assets/');
  if (at < 0 || !src.startsWith('/')) return null;
  return src.slice(0, at + 1);
}
