// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CSP_HEADER, CSP_HEADER_PDF, SECURITY_HEADERS } from '../config/csp.mjs';
import { renderNginxFiles, validateDirOption } from './nginx-config.mjs';

const template = readFileSync(new URL('../deploy/nginx.conf.template', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const render = (base: string, extra: { docroot?: string; includeDir?: string } = {}) =>
  renderNginxFiles({ template, base, ...extra });

describe('renderNginxFiles', () => {
  it('writes the five security headers from config/csp.mjs, one add_header line each', () => {
    const { 'security-headers.conf': headers } = render('/');
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(headers).toContain(`add_header ${name} "${value}" always;\n`);
    }
    expect(headers.trim().split('\n')).toHaveLength(5);
    expect(headers).toContain(`"${CSP_HEADER}"`);
    expect(headers).toContain("frame-ancestors 'none'");
  });

  it("writes pdf-headers.conf with the PDF CSP (frame-ancestors 'self') and the other four headers unchanged", () => {
    const { 'pdf-headers.conf': pdf } = render('/');
    expect(pdf).toContain(`add_header Content-Security-Policy "${CSP_HEADER_PDF}" always;\n`);
    expect(pdf).not.toContain("frame-ancestors 'none'");
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      if (name !== 'Content-Security-Policy') expect(pdf).toContain(`add_header ${name} "${value}" always;\n`);
    }
    expect(pdf.trim().split('\n')).toHaveLength(5);
  });

  it('renders the base-path locations for /', () => {
    const conf = render('/')['ucn-gs.conf'];
    expect(conf).toContain('location / {');
    expect(conf).toContain('alias /var/www/ucn-gs/;');
    expect(conf).toContain('try_files $uri $uri/index.html =404;');
    expect(conf).toContain('error_page 404 /404.html;');
    expect(conf).toContain('location /assets/ {');
    expect(conf).toContain('alias /var/www/ucn-gs/assets/;');
    expect(conf).toContain('add_header Cache-Control "public, max-age=31536000, immutable" always;');
    expect(conf).toContain('add_header Cache-Control "no-cache" always;');
    expect(conf).toContain('include /etc/nginx/ucn-gs/security-headers.conf;');
    expect(conf).toContain('include /etc/nginx/ucn-gs/pdf-headers.conf;');
    expect(conf).toContain('location ~* ^/(.+\\.pdf)$ {');
    expect(conf).toContain('location ~ ^/(.*/)?\\. {');
    expect(conf).toContain('autoindex off;');
  });

  it('renders the base-path locations for a subpath, escaping dots in the regex', () => {
    const conf = render('/gs.v2/')['ucn-gs.conf'];
    expect(conf).toContain('location /gs.v2/ {');
    expect(conf).toContain('error_page 404 /gs.v2/404.html;');
    expect(conf).toContain('location /gs.v2/assets/ {');
    expect(conf).toContain('location ~* ^/gs\\.v2/(.+\\.pdf)$ {');
    expect(conf).toContain('location ~ ^/gs\\.v2/(.*/)?\\. {\n    deny all;');
  });

  it('every location that adds a header also includes a headers file (add_header does not inherit)', () => {
    for (const base of ['/', '/gs/']) {
      const conf = render(base)['ucn-gs.conf'];
      const blocks = conf.split(/^location /m).slice(1);
      expect(blocks.length).toBeGreaterThanOrEqual(4);
      for (const block of blocks) {
        if (block.includes('add_header')) expect(block).toMatch(/include \S+(security|pdf)-headers\.conf;/);
      }
    }
  });

  it('uses the given docroot and include dir', () => {
    const conf = render('/gs/', { docroot: '/srv/site/', includeDir: '/etc/ucn/' })['ucn-gs.conf'];
    expect(conf).toContain('alias /srv/site/;');
    expect(conf).toContain('alias /srv/site/assets/;');
    expect(conf).toContain('alias /srv/site/$1;');
    expect(conf).toContain('include /etc/ucn/security-headers.conf;');
    expect(conf).not.toContain('/var/www');
  });

  it('rejects a docroot or include dir that could inject config', () => {
    for (const bad of ['/srv/a b/', '/srv/a"b/', "/srv/a'b/", '/srv/a;b/', '/srv/a{b/', '/srv/a}b/', '/srv/a$b/', '/srv/a\\b/', '/srv/site', 'srv/site/', '']) {
      expect(() => render('/', { docroot: bad })).toThrow(/UCN_DOCROOT/);
      expect(() => render('/', { includeDir: bad })).toThrow(/UCN_NGINX_INCLUDE_DIR/);
    }
    expect(validateDirOption('X', '/ok/dir-1/')).toBe('/ok/dir-1/');
  });

  it('throws on a leftover placeholder', () => {
    expect(() => renderNginxFiles({ template: `${template}\n# __SURPRISE__\n`, base: '/' })).toThrow(/__SURPRISE__/);
  });

  it('throws when a header value could break out of its quotes', () => {
    expect(() => renderNginxFiles({ template, base: '/', headers: { 'X-A': 'a"b' } })).toThrow(/X-A/);
  });
});
