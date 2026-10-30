/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';
import { normalizeBase } from './config/base.mjs';
import { CSP_META } from './config/csp.mjs';

/**
 * Adds the CSP fallback meta tag to production builds only.
 * The dev server needs an inline script for React Fast Refresh, which this policy would block.
 */
function cspMetaOnBuild(): Plugin {
  return {
    name: 'csp-meta-on-build',
    apply: 'build',
    transformIndexHtml(html) {
      // Insert right after <meta charset> so the charset stays first in <head> (it must be
      // within the first 1024 bytes) and the CSP still precedes every script and stylesheet.
      const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP_META.replaceAll('"', '&quot;')}" />`;
      const charset = /<meta\s+charset=[^>]*>/i.exec(html);
      if (!charset) throw new Error('index.html needs a <meta charset> tag as the first element of <head>.');
      const end = charset.index + charset[0].length;
      return `${html.slice(0, end)}\n    ${meta}${html.slice(end)}`;
    },
  };
}

/**
 * Keeps the dev sample PDF out of production builds. Rollup drops the unused sample module, but Vite
 * still emits every asset it loads, so without this stub dist/ would contain assets/sample-<hash>.pdf.
 * Preview builds (VITE_CONTENT_PREVIEW=true) keep the real file.
 */
function dropSamplePdfFromProduction(includeSamples: boolean): Plugin {
  return {
    name: 'drop-sample-pdf-from-production',
    apply: 'build',
    enforce: 'pre',
    load(id) {
      if (!includeSamples && id.split('?')[0]?.endsWith('/src/dev/sample.pdf')) return 'export default "";';
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // VITE_BASE_PATH=/gs/ in .env.production.local builds for a subpath (docs/deployment.md).
    base: normalizeBase(env.VITE_BASE_PATH),
    plugins: [react(), tailwindcss(), imagetools(), cspMetaOnBuild(), dropSamplePdfFromProduction(env.VITE_CONTENT_PREVIEW === 'true')],
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'config/**/*.test.ts'],
      exclude: ['**/*.live.test.ts', '**/node_modules/**'],
      // Suites have timed out at the 5000 ms default on a loaded OneDrive-hosted machine. 15 s is still short
      // enough that a real hang fails the run.
      testTimeout: 15000,
    },
    build: {
      sourcemap: false,
      target: 'es2020',
    },
  };
});
