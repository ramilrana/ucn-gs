/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import viteConfig from './vite.config';

// Live link check only (`npm run check:links`). Reuses the app's Vite config so the content modules
// (import.meta.glob, image imports) resolve exactly as they do in the app. The default `npm test`
// excludes `**/*.live.test.ts` in vite.config.ts, so this never runs offline or in CI.
export default defineConfig((env) => {
  const base = typeof viteConfig === 'function' ? viteConfig(env) : viteConfig;
  return {
    ...base,
    test: {
      environment: 'node',
      include: ['scripts/**/*.live.test.ts'],
      // Every target is fetched with a 15 s timeout, several at a time.
      testTimeout: 300_000,
    },
  };
});
