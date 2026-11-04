import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

afterEach(cleanup);

// Files that opt into `// @vitest-environment node` have no DOM to patch.
if (typeof window !== 'undefined') {
  // Lazy routes load their page chunk on first visit; under full-suite load on the OneDrive-hosted repo that
  // can exceed the default 1 s findBy*/waitFor budget. This only raises the ceiling: tests still resolve as
  // soon as they can.
  configure({ asyncUtilTimeout: 5000 });

  // jsdom does not implement the modal <dialog> API.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };

  // Browsers with an inline PDF viewer; tests may override per case.
  Object.defineProperty(navigator, 'pdfViewerEnabled', { value: true, configurable: true, writable: true });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
