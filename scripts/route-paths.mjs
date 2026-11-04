// Lists every route path that needs its own HTML copy in dist/.
// Reads the content folder directly so Node scripts do not depend on TypeScript sources.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * @param {string} dir
 * @param {RegExp} pattern
 * @returns {string[]} matching file names, sorted
 */
function listFiles(dir, pattern) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/**
 * Static paths from static-routes.json, then one path per area file and per recommendation file.
 * `*.test.ts` files and `.gitkeep` are ignored.
 *
 * @param {string} contentDir path to src/content
 * @returns {string[]}
 */
export function listRoutePaths(contentDir) {
  /** @type {Array<{ path: string }>} */
  const staticRoutes = JSON.parse(readFileSync(join(contentDir, 'static-routes.json'), 'utf8'));
  const paths = staticRoutes.map((route) => route.path);

  for (const file of listFiles(join(contentDir, 'areas'), /^(?!.*\.test\.ts$).+\.ts$/)) {
    paths.push(`/accreditation-areas/${file.replace(/\.ts$/, '')}`);
  }

  const recommendations = listFiles(join(contentDir, 'recommendations'), /^rec-\d+\.ts$/)
    .map((file) => Number(/^rec-(\d+)\.ts$/.exec(file)?.[1]))
    .sort((a, b) => a - b);
  for (const n of recommendations) {
    paths.push(`/compliance-report/recommendation-${n}`);
  }

  return paths;
}
