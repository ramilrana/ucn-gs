// @vitest-environment node
import { randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CSP_HEADER } from '../config/csp.mjs';
import { checkDist } from './check-dist.mjs';
import { listRoutePaths } from './route-paths.mjs';

const roots: string[] = [];
const PDF_BYTES = '%PDF-1.4\n%%EOF\n';

function write(file: string, content: string): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const indexHtml = (base: string, extra = ''): string =>
  `<!doctype html><html><head><link rel="modulepreload" href="${base}assets/vendor-a.js">${extra}</head>` +
  `<body><div id="root"></div><script type="module" src="${base}assets/index-a.js"></script></body></html>`;

function makeDist(base = '/gs/', extraHead = ''): string {
  const dist = mkdtempSync(join(tmpdir(), 'ucn-dist-'));
  roots.push(dist);
  const html = indexHtml(base, extraHead);
  write(join(dist, 'index.html'), html);
  write(join(dist, '404.html'), html);
  for (const p of listRoutePaths('src/content')) {
    if (p !== '/') write(join(dist, p, 'index.html'), html);
  }
  write(
    join(dist, '.htaccess'),
    `ErrorDocument 404 ${base}404.html\nHeader always set Content-Security-Policy "${CSP_HEADER}"\n`,
  );
  write(join(dist, 'assets', '.htaccess'), 'Header set Cache-Control "public, max-age=31536000, immutable"\n');
  write(join(dist, 'assets', 'index-a.js'), 'console.log("entry");');
  write(join(dist, 'assets', 'vendor-a.js'), 'console.log("vendor");');
  return dist;
}

afterEach(() => {
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});

describe('checkDist', () => {
  it('passes a complete dist built for base /gs/', () => {
    expect(checkDist(makeDist('/gs/'))).toEqual([]);
  });

  it('passes a complete dist built for the root base', () => {
    expect(checkDist(makeDist('/'))).toEqual([]);
  });

  it('flags a root-absolute asset URL when base is /gs/', () => {
    const errors = checkDist(makeDist('/gs/', '<link rel="preload" href="/fonts/x.woff2">'));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/fonts/x.woff2');
  });

  it('flags a missing route copy', () => {
    const dist = makeDist('/gs/');
    rmSync(join(dist, 'about', 'people'), { recursive: true });
    const errors = checkDist(dist);
    expect(errors.some((e) => e.includes('/about/people'))).toBe(true);
  });

  it('flags DEV-SAMPLE leakage', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'assets', 'chunk-b.js'), 'const x = "DEV-SAMPLE";');
    expect(checkDist(dist).some((e) => e.includes('DEV-SAMPLE'))).toBe(true);
  });

  it('flags the dev sample PDF anywhere under dist', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'assets', 'sample-abc123.pdf'), PDF_BYTES);
    const errors = checkDist(dist);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('assets/sample-abc123.pdf');
    const nested = makeDist('/gs/');
    write(join(nested, 'files', 'Sample.PDF'), PDF_BYTES);
    expect(checkDist(nested).some((e) => e.includes('files/Sample.PDF'))).toBe(true);
  });

  it('does not flag other PDFs', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'files', 'narrative-report.pdf'), PDF_BYTES);
    expect(checkDist(dist)).toEqual([]);
  });

  it('flags first-load JS over 120 kB gzip', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'assets', 'index-a.js'), randomBytes(400 * 1024).toString('base64'));
    expect(checkDist(dist).some((e) => /gzip/.test(e))).toBe(true);
  });

  it('flags a .htaccess whose ErrorDocument lacks the base', () => {
    const dist = makeDist('/gs/');
    write(join(dist, '.htaccess'), `ErrorDocument 404 /404.html\n${CSP_HEADER}\n`);
    expect(checkDist(dist).some((e) => e.includes('ErrorDocument 404 /gs/404.html'))).toBe(true);
  });

  it('flags a missing 404.html', () => {
    const dist = makeDist('/');
    rmSync(join(dist, '404.html'));
    expect(checkDist(dist).some((e) => e.includes('404.html'))).toBe(true);
  });
});

describe('listRoutePaths', () => {
  it('maps rec-03.ts to /compliance-report/recommendation-3 and ignores .gitkeep', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ucn-content-'));
    roots.push(dir);
    write(
      join(dir, 'static-routes.json'),
      JSON.stringify([
        { path: '/', title: 'Home', kind: 'home' },
        { path: '/about', title: 'About', kind: 'about' },
      ]),
    );
    write(join(dir, 'areas', '.gitkeep'), '');
    write(join(dir, 'areas', 'area-one.ts'), '');
    write(join(dir, 'areas', 'area-one.test.ts'), '');
    write(join(dir, 'recommendations', '.gitkeep'), '');
    write(join(dir, 'recommendations', 'rec-03.ts'), '');
    write(join(dir, 'recommendations', 'rec-12.ts'), '');
    expect(listRoutePaths(dir)).toEqual([
      '/',
      '/about',
      '/accreditation-areas/area-one',
      '/compliance-report/recommendation-3',
      '/compliance-report/recommendation-12',
    ]);
  });
});
