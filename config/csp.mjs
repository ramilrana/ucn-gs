// Single source of the Content-Security-Policy (spec section 8) and the other security headers.
// Used by vite.config.ts (meta fallback), scripts/write-route-pages.mjs (.htaccess) and the dist check.

/** The only hosts that may be framed. Iframe URLs are built from IDs in src/lib/resourceUrls.ts. */
export const FRAME_HOSTS = Object.freeze([
  'drive.google.com',
  'docs.google.com',
  'www.youtube-nocookie.com',
  'www.google.com',
]);

const DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: https://i.ytimg.com",
  `frame-src ${FRAME_HOSTS.map((host) => `https://${host}`).join(' ')}`,
  "media-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
];

/** Directives a <meta> CSP cannot enforce (frame-ancestors) or that break http://localhost previews. */
const HEADER_ONLY = new Set(['frame-ancestors', 'upgrade-insecure-requests']);

/** Full policy for the server header. */
export const CSP_HEADER = DIRECTIVES.join('; ');

/** Policy for the <meta http-equiv> fallback: the header policy minus header-only directives. */
export const CSP_META = DIRECTIVES.filter((directive) => !HEADER_ONLY.has(directive.split(' ')[0] ?? '')).join('; ');

/**
 * Headers set on every response. No Strict-Transport-Security: it is added only
 * once UCN confirms HTTPS (see docs/deployment.md).
 */
export const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': CSP_HEADER,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
});
