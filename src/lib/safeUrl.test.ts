import { describe, expect, it } from 'vitest';
import { safeHref } from './safeUrl';

describe('safeHref', () => {
  it.each([
    ['/files/a.pdf', '/files/a.pdf'],
    ['https://example.org/x?y=1', 'https://example.org/x?y=1'],
    ['mailto:gs@example.org', 'mailto:gs@example.org'],
    ['tel:+63541234567', 'tel:+63541234567'],
  ])('allows %s', (input, out) => expect(safeHref(input)).toBe(out));

  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'http://example.org',
    '//evil.example', 'ftp://x', '', 'not a url'])('rejects %j', (input) => expect(safeHref(input)).toBeNull());
});
