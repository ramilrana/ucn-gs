// Test-only helper. Not imported by app code.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * True when `publicPath` (for example `/files/report.pdf`) names a file under `publicDir` and every
 * path segment matches the on-disk name exactly. `existsSync` is case-insensitive on Windows and macOS,
 * so `/files/Report.pdf` would pass locally and return 404 on a case-sensitive Linux server.
 */
export function existsCaseExact(publicDir: string, publicPath: string): boolean {
  const segments = publicPath.split('/').filter(Boolean);
  if (segments.length === 0) return false;
  let dir = publicDir;
  for (const segment of segments) {
    if (segment === '.' || segment === '..') return false;
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      return false;
    }
    if (!names.includes(segment)) return false;
    dir = join(dir, segment);
  }
  try {
    return statSync(dir).isFile();
  } catch {
    return false;
  }
}
