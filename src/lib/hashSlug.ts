/** The slug the URL hash names, if it is one of `slugs`; a malformed hash such as "#%" names none. */
export function hashSlug(hash: string, slugs: readonly string[]): string | undefined {
  if (hash.length < 2) return undefined;
  try {
    const id = decodeURIComponent(hash.slice(1));
    return slugs.includes(id) ? id : undefined;
  } catch {
    return undefined;
  }
}
