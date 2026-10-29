/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';

// Mirrors public/_headers, minus directives that meta tags cannot enforce (frame-ancestors).
const CSP_META =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";

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

export default defineConfig({
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
});
