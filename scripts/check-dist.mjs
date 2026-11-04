// Verifies a built dist/ before it is uploaded. Run: npm run check:dist
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { baseFromIndexHtml } from '../config/base.mjs';
import { CSP_HEADER } from '../config/csp.mjs';
import { listRoutePaths } from './route-paths.mjs';

const MAX_FIRST_LOAD_GZIP_BYTES = 122_880; // 120 kB
const CONTENT_DIR = fileURLToPath(new URL('../src/content', import.meta.url));

/**
 * @param {string} dir
 * @returns {string[]} absolute paths of every file below dir
 */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/**
 * @param {string} html
 * @returns {string[]} hrefs of every <link rel="modulepreload">
 */
function modulePreloads(html) {
  const hrefs = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (/\brel="modulepreload"/i.test(tag)) {
      const href = /\bhref="([^"]+)"/i.exec(tag)?.[1];
      if (href) hrefs.push(href);
    }
  }
  return hrefs;
}

/**
 * @param {string} distDir
 * @returns {string[]} one message per failed rule; empty when dist is deployable
 */
export function checkDist(distDir) {
  /** @type {string[]} */
  const errors = [];
  const indexPath = join(distDir, 'index.html');

  // Rule 1
  if (!existsSync(indexPath)) errors.push('dist/index.html is missing.');
  if (!existsSync(join(distDir, '404.html'))) errors.push('dist/404.html is missing.');
  if (!existsSync(indexPath)) return errors;

  const html = readFileSync(indexPath, 'utf8');
  const base = baseFromIndexHtml(html);
  if (base === null) {
    errors.push('Cannot determine the base path: no <script type="module" src="/.../assets/..."> in dist/index.html.');
    return errors;
  }

  // Rule 2
  for (const path of listRoutePaths(CONTENT_DIR)) {
    if (path !== '/' && !existsSync(join(distDir, path, 'index.html'))) {
      errors.push(`Route ${path} has no dist${path}/index.html.`);
    }
  }

  // Rule 3
  const htaccessPath = join(distDir, '.htaccess');
  if (!existsSync(htaccessPath)) {
    errors.push('dist/.htaccess is missing.');
  } else {
    const htaccess = readFileSync(htaccessPath, 'utf8');
    const errorDocument = `ErrorDocument 404 ${base}404.html`;
    if (!htaccess.includes(errorDocument)) errors.push(`dist/.htaccess does not contain "${errorDocument}".`);
    if (!htaccess.includes(CSP_HEADER)) errors.push('dist/.htaccess does not contain the Content-Security-Policy header.');
  }
  if (!existsSync(join(distDir, 'assets', '.htaccess'))) errors.push('dist/assets/.htaccess is missing.');

  // Rule 4
  for (const [, url] of html.matchAll(/\b(?:src|href)="(\/[^"]*)"/gi)) {
    if (url && !url.startsWith(base)) {
      errors.push(`dist/index.html references "${url}", which does not start with the base "${base}".`);
    }
  }

  // Rule 5
  for (const file of walk(distDir)) {
    if (readFileSync(file).includes('DEV-SAMPLE')) {
      errors.push(`DEV-SAMPLE found in ${file.slice(distDir.length + 1).replaceAll('\\', '/')}; sample data must not ship.`);
    }
  }

  // Rule 6
  const entrySrc = /<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/i.exec(html)?.[1];
  const firstLoad = [...(entrySrc ? [entrySrc] : []), ...modulePreloads(html)];
  let gzipTotal = 0;
  for (const url of new Set(firstLoad)) {
    const file = join(distDir, url.startsWith(base) ? url.slice(base.length) : url.replace(/^\//, ''));
    if (!existsSync(file)) {
      errors.push(`First-load script ${url} is not in dist.`);
    } else {
      gzipTotal += gzipSync(readFileSync(file)).length;
    }
  }
  if (gzipTotal > MAX_FIRST_LOAD_GZIP_BYTES) {
    errors.push(`First-load JavaScript is ${gzipTotal} bytes gzip, over the ${MAX_FIRST_LOAD_GZIP_BYTES} byte (120 kB) limit.`);
  }

  // Rule 7: the dev sample PDF has no DEV-SAMPLE text, so rule 5 cannot see it.
  for (const file of walk(distDir)) {
    const name = file.slice(distDir.length + 1).replaceAll('\\', '/');
    if (/^sample[^/]*\.pdf$/i.test(name.split('/').pop() ?? '')) {
      errors.push(`Dev sample PDF found at ${name}; sample files must not ship.`);
    }
  }

  return errors;
}

const isCli = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const distDir = fileURLToPath(new URL('../dist', import.meta.url));
  const errors = checkDist(distDir);
  if (errors.length > 0) {
    console.error(`check:dist failed (${errors.length}):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log('check:dist passed.');
}
