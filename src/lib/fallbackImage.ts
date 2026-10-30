const FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#f0f0f0"/><text x="80" y="50" font-family="sans-serif" font-size="9" fill="#8c8c8c" text-anchor="middle">Image unavailable</text></svg>';

/** Inline placeholder shown when an image fails to load. It is not a remote media source. */
export const FALLBACK_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FALLBACK_SVG)}`;
