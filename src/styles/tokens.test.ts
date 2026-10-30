// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8');
const themeBlock = /@theme\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';

const tokens = new Map<string, string>();
for (const m of themeBlock.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  const [, name, hex] = m;
  if (name && hex) tokens.set(name, hex);
}

function token(name: string): string {
  if (name === 'white') return '#ffffff';
  const hex = tokens.get(name);
  if (!hex) throw new Error(`Missing colour token: ${name}`);
  return hex;
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('colour tokens', () => {
  it.each([
    ['white', 'maroon-800', 7],
    ['ink', 'white', 7],
    ['ink', 'paper', 7],
    ['maroon-800', 'white', 4.5],
    ['maroon-800', 'paper', 4.5],
    ['gold-500', 'maroon-800', 4.5],
    ['gold-500', 'maroon-900', 4.5],
    ['ink-muted', 'white', 4.5],
    ['ink-muted', 'paper', 4.5],
  ])('%s on %s ≥ %d:1', (fg, bg, min) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(min);
  });

  it('gold-500 on white stays below 3:1 so the D9 rule is meaningful', () => {
    expect(contrast(token('gold-500'), '#ffffff')).toBeLessThan(3);
  });
});
