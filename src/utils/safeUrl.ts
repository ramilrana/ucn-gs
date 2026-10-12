const ALLOWED_HOSTS: readonly string[] = [
  // 'cdn.yourdomain.com',
];

/** Returns the URL only if it is a local path or an allow-listed HTTPS host. */
export function safeUrl(url: string): string | null {
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && ALLOWED_HOSTS.includes(parsed.hostname)) {
      return parsed.toString();
    }
  } catch {
    // Invalid URL: fall through and reject it.
  }
  return null;
}
