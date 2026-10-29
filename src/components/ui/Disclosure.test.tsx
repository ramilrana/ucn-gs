import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { Disclosure } from './Disclosure';

it('is closed by default and opens with defaultOpen', () => {
  const { container, rerender } = render(<Disclosure summary="Q">A</Disclosure>);
  expect(container.querySelector('details')?.hasAttribute('open')).toBe(false);
  rerender(<Disclosure summary="Q" defaultOpen>A</Disclosure>);
  expect(container.querySelector('details')?.hasAttribute('open')).toBe(true);
});

// jsdom does not implement the browser rule "Enter/Space on a focused <summary> fires click",
// and user-event does not synthesize it either, so Enter alone cannot toggle <details> here.
// What can be verified: the summary is a native, keyboard-focusable <summary>, and activating it
// (the click that Enter/Space produce in browsers) toggles the element open and closed.
// The real Enter/Space check happens in the Task 27 browser keyboard pass.
it('summary is natively focusable and activation toggles it', async () => {
  const user = userEvent.setup();
  const { container } = render(<Disclosure summary="Question">Answer</Disclosure>);
  const details = container.querySelector('details');
  const summary = container.querySelector('summary');
  expect(details?.hasAttribute('open')).toBe(false);

  await user.tab();
  expect(document.activeElement).toBe(summary);

  await user.click(summary as HTMLElement);
  expect(details?.hasAttribute('open')).toBe(true);
  await user.click(summary as HTMLElement);
  expect(details?.hasAttribute('open')).toBe(false);
});

it('summary has a 44px target and the chevron is hidden from assistive tech', () => {
  const { container } = render(<Disclosure summary="Q">A</Disclosure>);
  const summary = container.querySelector('summary');
  expect(summary?.classList.contains('min-h-11')).toBe(true);
  expect(summary?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
});
