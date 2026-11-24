// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CSP_HEADER_PDF, SECURITY_HEADERS } from './csp.mjs';

// vercel.json is for TEST deployments on Vercel only (user's request, 2026-11-24); the real server is Nginx.
// These tests keep its headers in step with config/csp.mjs, the single source of the policy.

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  headers: HeaderRule[];
};

const [pages, pdfs, assets] = config.headers as [HeaderRule, HeaderRule, HeaderRule];
const asObject = (rule: HeaderRule): Record<string, string> =>
  Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
// Vercel compiles `source` with path-to-regexp; for these patterns a plain anchored RegExp matches the same paths.
const matches = (rule: HeaderRule, path: string): boolean => new RegExp(`^${rule.source}$`).test(path);

describe('vercel.json', () => {
  it('builds the production site into dist/', () => {
    expect(config.installCommand).toBe('npm ci');
    expect(config.buildCommand).toBe('npm run build');
    expect(config.outputDirectory).toBe('dist');
  });

  it('sends the security headers from config/csp.mjs, plus noindex, on pages and assets', () => {
    expect(asObject(pages)).toEqual({ ...SECURITY_HEADERS, 'X-Robots-Tag': 'noindex' });
  });

  it("sends the PDF policy (frame-ancestors 'self') and no-cache on PDFs", () => {
    expect(asObject(pdfs)).toEqual({
      ...SECURITY_HEADERS,
      'Content-Security-Policy': CSP_HEADER_PDF,
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'no-cache',
    });
  });

  it.each(['/', '/about/people', '/about/people/', '/assets/index-a1b2c3.js', '/files/notes.pdf.txt', '/404.html'])(
    '%s gets the page headers only',
    (path) => {
      expect(matches(pages, path)).toBe(true);
      expect(matches(pdfs, path)).toBe(false);
    },
  );

  it.each(['/files/research/icop-2024.pdf', '/files/A.PDF', '/certificate.Pdf'])('%s gets the PDF headers only', (path) => {
    expect(matches(pdfs, path)).toBe(true);
    expect(matches(pages, path)).toBe(false);
  });

  it('caches hashed assets for a year', () => {
    expect(matches(assets, '/assets/index-a1b2c3.js')).toBe(true);
    expect(matches(assets, '/about/')).toBe(false);
    expect(asObject(assets)).toEqual({ 'Cache-Control': 'public, max-age=31536000, immutable' });
  });
});
