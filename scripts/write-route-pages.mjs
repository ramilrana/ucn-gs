// Runs after `vite build`: copies index.html to every route folder and to 404.html,
// and writes the Apache config. The base path is read from dist/index.html.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseFromIndexHtml } from '../config/base.mjs';
import { SECURITY_HEADERS } from '../config/csp.mjs';
import { listRoutePaths } from './route-paths.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const indexPath = join(dist, 'index.html');

/** Reads a deploy template as LF text: a Windows checkout may have CRLF, and .htaccess should be LF. */
const readTemplate = (name) => readFileSync(join(root, 'deploy', name), 'utf8').replace(/\r\n/g, '\n');

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html not found. Run `vite build` first.');
}
const base = baseFromIndexHtml(readFileSync(indexPath, 'utf8'));
if (base === null) {
  throw new Error('Cannot read the base path from dist/index.html.');
}

for (const path of listRoutePaths(join(root, 'src', 'content'))) {
  if (path === '/') continue;
  const target = join(dist, path, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(indexPath, target);
}
copyFileSync(indexPath, join(dist, '404.html'));

// __BASE__ and __CSP__ plus one __<Header-Name>__ placeholder per remaining security header.
let htaccess = readTemplate('htaccess.template').replaceAll('__BASE__', base);
for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
  const placeholder = name === 'Content-Security-Policy' ? '__CSP__' : `__${name}__`;
  htaccess = htaccess.replaceAll(placeholder, value);
}
const leftover = htaccess.match(/__[A-Za-z-]+__/);
if (leftover) {
  throw new Error(`Unreplaced placeholder ${leftover[0]} in deploy/htaccess.template.`);
}
writeFileSync(join(dist, '.htaccess'), htaccess);

mkdirSync(join(dist, 'assets'), { recursive: true });
writeFileSync(join(dist, 'assets', '.htaccess'), readTemplate('assets.htaccess'));

console.log(`Wrote route pages, 404.html and .htaccess for base ${base}`);
