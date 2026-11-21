import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function mountSplash() {
  document.documentElement.classList.add('is-loading');
  document.body.innerHTML = '<div id="splash" class="splash"></div>';
  return document.getElementById('splash') as HTMLElement;
}

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce && query.includes('reduce'), media: query }));
}

describe('dismissSplash', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.documentElement.classList.remove('is-loading');
    document.body.innerHTML = '';
  });

  it('fades the splash out, then hides it and lets the text animations play', async () => {
    mockReducedMotion(false);
    const splash = mountSplash();
    const { dismissSplash } = await import('./splash');

    dismissSplash();
    vi.advanceTimersByTime(900);
    expect(splash.classList.contains('splash--leaving')).toBe(true);
    expect(splash.hidden).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(splash.hidden).toBe(true);
    expect(document.documentElement.classList.contains('is-loading')).toBe(false);
  });

  it('removes the splash at once under reduced motion', async () => {
    mockReducedMotion(true);
    const splash = mountSplash();
    const { dismissSplash } = await import('./splash');

    dismissSplash();
    expect(splash.hidden).toBe(true);
    expect(document.documentElement.classList.contains('is-loading')).toBe(false);
  });

  it('only acts once', async () => {
    mockReducedMotion(true);
    const splash = mountSplash();
    const { dismissSplash } = await import('./splash');

    dismissSplash();
    splash.hidden = false;
    dismissSplash();
    expect(splash.hidden).toBe(false);
  });

  it('still clears the loading state when there is no splash element', async () => {
    mockReducedMotion(false);
    document.documentElement.classList.add('is-loading');
    const { dismissSplash } = await import('./splash');

    dismissSplash();
    expect(document.documentElement.classList.contains('is-loading')).toBe(false);
  });
});
