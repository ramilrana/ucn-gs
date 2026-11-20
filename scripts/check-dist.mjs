// Verifies a built dist/ before it is uploaded. Run: npm run check:dist
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { baseFromIndexHtml } from '../config/base.mjs';
import { CSP_HEADER, CSP_HEADER_PDF, SECURITY_HEADERS } from '../config/csp.mjs';
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

const ACTIVE_EXTENSIONS = /\.(?:html?|svg|xml|xhtml|m?js)$/i;

/**
 * @param {string} dir
 * @returns {{ path: string, directory: boolean }[]} every file and folder below dir
 */
function walkEntries(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? [{ path: full, directory: true }, ...walkEntries(full)] : [{ path: full, directory: false }];
  });
}

/** @param {string} distDir @param {string} file */
const relName = (distDir, file) => `dist/${file.slice(distDir.length + 1).replaceAll('\\', '/')}`;

/**
 * @param {string} nginxDir
 * @param {string} base
 * @returns {string[]} one message per failed check of dist-nginx/
 */
function checkNginx(nginxDir, base) {
  /** @type {string[]} */
  const errors = [];
  /** @param {string} name @returns {string | null} */
  const read = (name) => {
    const file = join(nginxDir, name);
    if (existsSync(file)) return readFileSync(file, 'utf8');
    errors.push(`dist-nginx/${name} is missing. Run the build.`);
    return null;
  };

  /** @param {string} name @param {string | null} text @param {string} csp */
  const checkHeaders = (name, text, csp) => {
    if (text === null) return;
    for (const [header, value] of Object.entries({ ...SECURITY_HEADERS, 'Content-Security-Policy': csp })) {
      const line = `add_header ${header} "${value}" always;`;
      if (!text.split('\n').includes(line)) errors.push(`dist-nginx/${name} does not contain ${header} exactly as config/csp.mjs defines it.`);
    }
  };
  checkHeaders('security-headers.conf', read('security-headers.conf'), CSP_HEADER);
  checkHeaders('pdf-headers.conf', read('pdf-headers.conf'), CSP_HEADER_PDF);

  const conf = read('ucn-gs.conf');
  if (conf === null) return errors;
  const errorPage = `error_page 404 ${base}404.html;`;
  if (!conf.includes(errorPage)) errors.push(`dist-nginx/ucn-gs.conf does not contain "${errorPage}".`);

  const blocks = conf.split(/^location /m).slice(1);
  const assets = blocks.find((block) => block.startsWith(`${base}assets/ {`));
  if (!assets || !assets.includes('add_header Cache-Control "public, max-age=31536000, immutable" always;')) {
    errors.push(`dist-nginx/ucn-gs.conf has no immutable cache block for ${base}assets/.`);
  }
  if (!blocks.some((block) => /^~ \S*\\\. \{\s+deny all;/.test(block))) {
    errors.push('dist-nginx/ucn-gs.conf has no dotfile deny block.');
  }
  if (!blocks.some((block) => /^~\* \S*\.pdf\)\$ \{/.test(block) && /include \S*pdf-headers\.conf;/.test(block))) {
    errors.push('dist-nginx/ucn-gs.conf has no .pdf location that includes pdf-headers.conf.');
  }
  // add_header is not inherited into a block that has its own, so each such block must include a headers file.
  for (const block of blocks) {
    if (block.includes('add_header') && !/include \S*(?:security|pdf)-headers\.conf;/.test(block)) {
      errors.push(`dist-nginx/ucn-gs.conf: location ${block.split('{')[0]?.trim()} sets a header but includes no headers file.`);
    }
  }
  return errors;
}

/**
 * @param {string} distDir
 * @param {string} [nginxDir] generated Nginx files; defaults to dist-nginx/ next to distDir
 * @returns {string[]} one message per failed rule; empty when dist is deployable
 */
export function checkDist(distDir, nginxDir = join(dirname(distDir), 'dist-nginx')) {
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

  // Rule 3: the generated Nginx config (dist-nginx/, next to dist/) and no leftover Apache files.
  errors.push(...checkNginx(nginxDir, base));
  for (const file of walk(distDir)) {
    if (basename(file).toLowerCase() === '.htaccess') {
      errors.push(`${relName(distDir, file)} found; the build no longer ships Apache config.`);
    }
  }

  // Rule 8: nothing under dist/files/ may be active content, so a same-origin frame can only hold a PDF.
  const filesDir = join(distDir, 'files');
  if (existsSync(filesDir)) {
    for (const entry of walkEntries(filesDir)) {
      const name = relName(distDir, entry.path);
      if (entry.directory && /\.pdf$/i.test(entry.path)) {
        errors.push(`${name} is a directory with a .pdf name; Nginx could serve HTML under a .pdf URL.`);
      } else if (!entry.directory && ACTIVE_EXTENSIONS.test(entry.path)) {
        errors.push(`${name} is active content under dist/files/; only documents and media may ship there.`);
      }
    }
  }

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
    if (/^(?:dev-)?sample[^/]*\.pdf$/i.test(name.split('/').pop() ?? '')) {
      errors.push(`Dev sample PDF found at ${name}; sample files must not ship.`);
    }
  }

  // Rule 9: dev-only stand-in photos (src/dev/placeholders/dev-placeholder-*) must not ship; production shows a silhouette.
  for (const file of walk(distDir)) {
    const name = file.slice(distDir.length + 1).replaceAll('\\', '/');
    if (/^dev-placeholder/i.test(name.split('/').pop() ?? '')) {
      errors.push(`Dev placeholder photo found at ${name}; placeholder images must not ship.`);
    } else if (readFileSync(file).includes('dev-placeholder')) {
      // A reference to a placeholder photo means the dev-only module was bundled (it would ship a broken photo).
      errors.push(`${name} references a dev placeholder photo; dev placeholder code must not ship.`);
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
