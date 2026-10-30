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

export default defineConfig(({ mode }) => ({
  // VITE_BASE_PATH=/gs/ in .env.production.local builds for a subpath (docs/deployment.md).
  base: normalizeBase(loadEnv(mode, process.cwd(), '').VITE_BASE_PATH),
  plugins: [react(), tailwindcss(), imagetools(), cspMetaOnBuild()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'config/**/*.test.ts'],
    exclude: ['**/*.live.test.ts', '**/node_modules/**'],
  },
  build: {
    sourcemap: false,
    target: 'es2020',
  },
}));
