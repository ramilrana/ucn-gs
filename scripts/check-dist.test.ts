// @vitest-environment node
import { randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CSP_HEADER_PDF, CSP_HEADER } from '../config/csp.mjs';
import { checkDist } from './check-dist.mjs';
import { renderNginxFiles } from './nginx-config.mjs';
import { listRoutePaths } from './route-paths.mjs';

const roots: string[] = [];
const PDF_BYTES = '%PDF-1.4\n%%EOF\n';
const template = readFileSync(new URL('../deploy/nginx.conf.template', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function write(file: string, content: string): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const indexHtml = (base: string, extra = ''): string =>
  `<!doctype html><html><head><link rel="modulepreload" href="${base}assets/vendor-a.js">${extra}</head>` +
  `<body><div id="root"></div><script type="module" src="${base}assets/index-a.js"></script></body></html>`;

/** The generated Nginx files sit next to dist/, as the build writes them. */
const nginxFile = (dist: string, name: string): string => join(dirname(dist), 'dist-nginx', name);

function makeDist(base = '/gs/', extraHead = ''): string {
  const parent = mkdtempSync(join(tmpdir(), 'ucn-dist-'));
  roots.push(parent);
  const dist = join(parent, 'dist');
  const html = indexHtml(base, extraHead);
  write(join(dist, 'index.html'), html);
  write(join(dist, '404.html'), html);
  for (const p of listRoutePaths('src/content')) {
    if (p !== '/') write(join(dist, p, 'index.html'), html);
  }
  for (const [name, content] of Object.entries(renderNginxFiles({ template, base }))) {
    write(nginxFile(dist, name), content);
  }
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

  it('flags files/dev-sample.pdf in a production dist', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'files', 'dev-sample.pdf'), PDF_BYTES);
    const errors = checkDist(dist);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('files/dev-sample.pdf');
  });

  it('flags a dev placeholder photo anywhere under dist', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'assets', 'dev-placeholder-dean-Ab12Cd.webp'), 'x');
    const errors = checkDist(dist);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('assets/dev-placeholder-dean-Ab12Cd.webp');
  });

  it('flags a bundled reference to a dev placeholder photo', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'assets', 'index-Ab12Cd.js'), 'const p="/assets/dev-placeholder-dean-Ab12Cd.jpg";');
    const errors = checkDist(dist);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('assets/index-Ab12Cd.js references a dev placeholder photo');
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

  it('flags a conf whose error_page lacks the base', () => {
    const dist = makeDist('/gs/');
    const conf = readFileSync(nginxFile(dist, 'ucn-gs.conf'), 'utf8');
    write(nginxFile(dist, 'ucn-gs.conf'), conf.replaceAll('error_page 404 /gs/404.html;', 'error_page 404 /404.html;'));
    expect(checkDist(dist).some((e) => e.includes('error_page 404 /gs/404.html;'))).toBe(true);
  });

  it('flags a missing dist-nginx file', () => {
    for (const name of ['ucn-gs.conf', 'security-headers.conf', 'pdf-headers.conf']) {
      const dist = makeDist('/gs/');
      rmSync(nginxFile(dist, name));
      expect(checkDist(dist).some((e) => e.includes(name))).toBe(true);
    }
  });

  it('flags a security-headers.conf without the exact CSP, or with a header missing', () => {
    const dist = makeDist('/gs/');
    const file = nginxFile(dist, 'security-headers.conf');
    const text = readFileSync(file, 'utf8');
    write(file, text.replace("default-src 'self'", 'default-src *'));
    expect(checkDist(dist).some((e) => e.includes('security-headers.conf') && e.includes('Content-Security-Policy'))).toBe(true);
    write(file, text.split('\n').filter((l) => !l.includes('Referrer-Policy')).join('\n'));
    expect(checkDist(dist).some((e) => e.includes('Referrer-Policy'))).toBe(true);
  });

  it("flags a pdf-headers.conf that lacks the PDF CSP (frame-ancestors 'self')", () => {
    const dist = makeDist('/gs/');
    const file = nginxFile(dist, 'pdf-headers.conf');
    write(file, readFileSync(file, 'utf8').replace(CSP_HEADER_PDF, CSP_HEADER));
    expect(checkDist(dist).some((e) => e.includes('pdf-headers.conf'))).toBe(true);
  });

  it('flags a conf with no immutable assets block for the base', () => {
    const dist = makeDist('/gs/');
    const file = nginxFile(dist, 'ucn-gs.conf');
    write(file, readFileSync(file, 'utf8').replace('immutable', 'must-revalidate'));
    expect(checkDist(dist).some((e) => e.includes('immutable'))).toBe(true);
  });

  it('flags a conf with no dotfile deny', () => {
    const dist = makeDist('/gs/');
    const file = nginxFile(dist, 'ucn-gs.conf');
    write(file, readFileSync(file, 'utf8').replace('deny all;', 'allow all;'));
    expect(checkDist(dist).some((e) => e.includes('dotfile'))).toBe(true);
  });

  it('flags a conf with no .pdf location using pdf-headers.conf', () => {
    const dist = makeDist('/gs/');
    const file = nginxFile(dist, 'ucn-gs.conf');
    write(file, readFileSync(file, 'utf8').replace('pdf-headers.conf;', 'security-headers.conf;'));
    expect(checkDist(dist).some((e) => e.includes('.pdf'))).toBe(true);
  });

  it('flags a location block that sets add_header but includes no headers file', () => {
    const dist = makeDist('/gs/');
    const file = nginxFile(dist, 'ucn-gs.conf');
    const conf = readFileSync(file, 'utf8');
    const stripped = conf.replace(/^\s*include \S*security-headers\.conf;\n/m, '');
    expect(stripped).not.toBe(conf);
    write(file, stripped);
    const errors = checkDist(dist);
    expect(errors.some((e) => e.includes('sets a header but includes no headers file'))).toBe(true);
  });

  it('flags any .htaccess left in dist', () => {
    const dist = makeDist('/gs/');
    write(join(dist, '.htaccess'), 'Options -Indexes\n');
    write(join(dist, 'assets', '.htaccess'), 'x\n');
    expect(checkDist(dist).filter((e) => e.includes('.htaccess'))).toHaveLength(2);
  });

  it('flags active content under dist/files/, whatever the case', () => {
    for (const name of ['a.html', 'a.HTM', 'x/b.svg', 'c.xml', 'd.xhtml', 'e.js', 'f.mjs', 'G.Html']) {
      const dist = makeDist('/gs/');
      write(join(dist, 'files', name), '<script>1</script>');
      const errors = checkDist(dist);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain(`files/${name}`);
    }
  });

  it('flags a directory named like a PDF under dist/files/', () => {
    for (const name of ['evil.pdf', 'sub/EVIL.PDF']) {
      const dist = makeDist('/gs/');
      write(join(dist, 'files', name, 'index.txt'), 'x');
      expect(checkDist(dist).some((e) => e.includes(`files/${name}`))).toBe(true);
    }
  });

  it('does not flag active-content extensions outside dist/files/ or harmless files inside', () => {
    const dist = makeDist('/gs/');
    write(join(dist, 'about', 'extra.html'), 'x');
    write(join(dist, 'files', 'photo.jpg'), 'x');
    write(join(dist, 'files', 'notes.html.txt'), 'x');
    expect(checkDist(dist)).toEqual([]);
  });

  it('flags a missing 404.html', () => {
    const dist = makeDist('/');
    rmSync(join(dist, '404.html'));
    expect(checkDist(dist).some((e) => e.includes('404.html'))).toBe(true);
  });
});

describe('listRoutePaths', () => {
  it('maps research/rec-03.ts to /compliance-report/research/recommendation-3 and ignores .gitkeep', () => {
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
    write(join(dir, 'recommendations', 'research', '.gitkeep'), '');
    write(join(dir, 'recommendations', 'research', 'rec-03.ts'), '');
    write(join(dir, 'recommendations', 'research', 'rec-12.ts'), '');
    write(join(dir, 'recommendations', 'community-service', 'rec-01.ts'), '');
    expect(listRoutePaths(dir)).toEqual([
      '/',
      '/about',
      '/accreditation-areas/area-one',
      '/compliance-report/community-service/recommendation-1',
      '/compliance-report/research/recommendation-3',
      '/compliance-report/research/recommendation-12',
    ]);
  });
});
