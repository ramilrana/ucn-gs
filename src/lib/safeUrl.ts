// Browsers treat "\" like "/" and strip tab, CR and LF, so "/\x" or "/<TAB>/x"
// would resolve as a protocol-relative external URL.
// eslint-disable-next-line no-control-regex
const UNSAFE_PATH_CHARS = /[\\\u0000-\u001f\u007f]/;

/**
 * Returns the URL only if it is a root-relative path, an https: URL,
 * a mailto: link or a tel: link. Everything else is rejected with null.
 */
export function safeHref(url: string): string | null {
  if (url.startsWith('/')) {
    return !url.startsWith('//') && !UNSAFE_PATH_CHARS.test(url) ? url : null;
  }
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return parsed.toString();
  } catch {
    // Invalid URL: fall through and reject it.
  }
  return null;
}
