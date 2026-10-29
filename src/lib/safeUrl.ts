/**
 * Returns the URL only if it is a root-relative path, an https: URL,
 * a mailto: link or a tel: link. Everything else is rejected with null.
 */
export function safeHref(url: string): string | null {
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return parsed.toString();
  } catch {
    // Invalid URL: fall through and reject it.
  }
  return null;
}
