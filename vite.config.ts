/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
 * Serves the dev sample PDF at the real URL /files/dev-sample.pdf (the path src/dev/samples.ts uses): from the
 * dev server, and as files/dev-sample.pdf in preview-content builds. A production build never gets it, and
 * check:dist fails if it does. The source lives in src/dev/, not public/, so it cannot ship by accident.
 */
function devSamplePdf(includeSamples: boolean, base: string): Plugin {
  const source = fileURLToPath(new URL('./src/dev/sample.pdf', import.meta.url));
  return {
    name: 'dev-sample-pdf',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0] ?? '';
        if (path !== '/files/dev-sample.pdf' && path !== `${base}files/dev-sample.pdf`) return next();
        res.setHeader('Content-Type', 'application/pdf');
        res.end(readFileSync(source));
      });
    },
    generateBundle() {
      if (!includeSamples) return;
      this.emitFile({ type: 'asset', fileName: 'files/dev-sample.pdf', source: readFileSync(source) });
    },
  };
}

/**
 * Serves the leader-message stand-in photos (src/dev/placeholders/) at <base>dev-placeholders/ in dev and copies them
 * into preview-content builds only. They are plain files, not imports, so a production build never emits them
 * (check:dist rule 9 fails if one does).
 */
function devPlaceholderPhotos(includeSamples: boolean, base: string): Plugin {
  const dir = fileURLToPath(new URL('./src/dev/placeholders/', import.meta.url));
  const names = ['dev-placeholder-president.jpg', 'dev-placeholder-dean.jpg', 'dev-placeholder-chair.jpg'];
  return {
    name: 'dev-placeholder-photos',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0] ?? '';
        const name = names.find((n) => path === `/dev-placeholders/${n}` || path === `${base}dev-placeholders/${n}`);
        if (!name) return next();
        res.setHeader('Content-Type', 'image/jpeg');
        res.end(readFileSync(`${dir}${name}`));
      });
    },
    generateBundle() {
      if (!includeSamples) return;
      for (const name of names) {
        this.emitFile({ type: 'asset', fileName: `dev-placeholders/${name}`, source: readFileSync(`${dir}${name}`) });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = normalizeBase(env.VITE_BASE_PATH);
  return {
    // VITE_BASE_PATH=/gs/ in .env.production.local builds for a subpath (docs/deployment.md).
    base,
    plugins: [react(), tailwindcss(), imagetools(), cspMetaOnBuild(), devSamplePdf(env.VITE_CONTENT_PREVIEW === 'true', base),
      devPlaceholderPhotos(env.VITE_CONTENT_PREVIEW === 'true', base),
    ],
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
