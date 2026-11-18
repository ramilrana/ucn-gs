// Runs after `vite build`: copies index.html to every route folder and to 404.html,
// and writes the Nginx config into dist-nginx/ (outside the web root). The base path is read from dist/index.html.
// Env: UCN_DOCROOT (default /var/www/ucn-gs/) and UCN_NGINX_INCLUDE_DIR (default /etc/nginx/ucn-gs/).
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseFromIndexHtml } from '../config/base.mjs';
import { renderNginxFiles } from './nginx-config.mjs';
import { listRoutePaths } from './route-paths.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const nginxOut = join(root, 'dist-nginx');
const indexPath = join(dist, 'index.html');

/** Reads a deploy template as LF text: a Windows checkout may have CRLF, and the generated config should be LF. */
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

const files = renderNginxFiles({
  template: readTemplate('nginx.conf.template'),
  base,
  ...(process.env.UCN_DOCROOT ? { docroot: process.env.UCN_DOCROOT } : {}),
  ...(process.env.UCN_NGINX_INCLUDE_DIR ? { includeDir: process.env.UCN_NGINX_INCLUDE_DIR } : {}),
});
rmSync(nginxOut, { recursive: true, force: true });
mkdirSync(nginxOut, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(nginxOut, name), content);
}

console.log(`Wrote route pages, 404.html and dist-nginx/ for base ${base}`);
