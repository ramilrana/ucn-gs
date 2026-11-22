import { describe, expect, it } from 'vitest';
import { areaEyebrow } from './areaLabel';

describe('areaEyebrow', () => {
  it('turns the area order into a Roman numeral label', () => {
    expect(areaEyebrow(1)).toBe('Area I');
    expect(areaEyebrow(4)).toBe('Area IV');
    expect(areaEyebrow(10)).toBe('Area X');
  });

  it('returns undefined outside 1..10', () => {
    expect(areaEyebrow(0)).toBeUndefined();
    expect(areaEyebrow(11)).toBeUndefined();
  });
});
