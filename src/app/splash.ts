/**
 * The page-load splash lives in index.html (styled by src/styles/splash.css) so it shows before any script runs.
 * dismissSplash() fades it out once the first page has rendered, then removes `is-loading` from <html>, which starts
 * the text entrance animations (they wait paused under the splash).
 */

/** Shortest time the splash stays up, counted from navigation start, so a fast load does not just flash it. */
const MIN_VISIBLE_MS = 900;
/** The fade-out transition in splash.css. */
const EXIT_MS = 450;
/** If the app never reports ready (a crash before the first page), stop covering the page after this long. */
export const GIVE_UP_MS = 8000;

let dismissed = false;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function finish(splash: HTMLElement | null): void {
  splash?.setAttribute('hidden', '');
  splash?.classList.remove('splash--leaving');
  document.documentElement.classList.remove('is-loading');
}

/** Safe to call many times; only the first call does anything. */
export function dismissSplash(): void {
  if (dismissed) return;
  dismissed = true;

  const splash = document.getElementById('splash');
  if (!splash || prefersReducedMotion()) {
    finish(splash);
    return;
  }

  const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
  window.setTimeout(() => {
    splash.classList.add('splash--leaving');
    // Start the text animations as the splash begins to clear, so they are underway when it is gone.
    window.setTimeout(() => document.documentElement.classList.remove('is-loading'), EXIT_MS / 3);
    window.setTimeout(() => finish(splash), EXIT_MS);
  }, wait);
}
