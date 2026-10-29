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
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP_META },
          injectTo: 'head-prepend',
        },
      ];
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
