// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { baseFromIndexHtml, normalizeBase } from './base.mjs';
import { CSP_HEADER, CSP_META, FRAME_HOSTS, SECURITY_HEADERS } from './csp.mjs';

describe('normalizeBase', () => {
  it.each([
    [undefined, '/'],
    ['', '/'],
    ['gs', '/gs/'],
    ['/gs', '/gs/'],
    ['/gs/', '/gs/'],
    ['//a//', '/a/'],
  ])('normalizeBase(%j) → %s', (i, o) => expect(normalizeBase(i)).toBe(o));
});

describe('baseFromIndexHtml', () => {
  const html = (src: string): string => `<html><head><script type="module" crossorigin src="${src}"></script></head></html>`;

  it.each([
    ['/assets/index-a.js', '/'],
    ['/gs/assets/index-a.js', '/gs/'],
    ['/ucn-assets/assets/index-a.js', '/ucn-assets/'],
    ['/assets/assets/index-a.js', '/assets/'],
    ['/a/b/assets/index-a.js', '/a/b/'],
  ])('src %s gives base %s', (src, base) => expect(baseFromIndexHtml(html(src))).toBe(base));

  it('returns null when there is no module script or no assets/ segment', () => {
    expect(baseFromIndexHtml('<html></html>')).toBeNull();
    expect(baseFromIndexHtml(html('/main.js'))).toBeNull();
  });
});

describe('csp', () => {
  it('CSP header is the spec string', () =>
    expect(CSP_HEADER).toBe(
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://i.ytimg.com; frame-src https://drive.google.com https://docs.google.com https://www.youtube-nocookie.com https://www.google.com; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests",
    ));

  it('meta CSP drops header-only directives', () => {
    expect(CSP_META).not.toMatch(/frame-ancestors|upgrade-insecure-requests/);
    expect(CSP_META).toContain('frame-src https://drive.google.com');
  });

  it('lists exactly the four frame hosts', () => {
    expect(FRAME_HOSTS).toEqual([
      'drive.google.com',
      'docs.google.com',
      'www.youtube-nocookie.com',
      'www.google.com',
    ]);
  });

  it('security headers carry the CSP and no HSTS', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy']).toBe(CSP_HEADER);
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(SECURITY_HEADERS['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=(), payment=()');
    expect(SECURITY_HEADERS['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(SECURITY_HEADERS).not.toHaveProperty('Strict-Transport-Security');
  });
});
