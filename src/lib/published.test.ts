import { afterEach, expect, it, vi } from 'vitest';
import { isVisible, showPending, slotValue, visible } from './published';

afterEach(() => vi.unstubAllEnvs());
const items = [{ status: 'published' as const, id: 'a' }, { status: 'pending' as const, id: 'b' }];
it('production hides pending', () => { vi.stubEnv('DEV', false); vi.stubEnv('VITE_CONTENT_PREVIEW', '');
  expect(visible(items).map((i) => i.id)).toEqual(['a']); expect(showPending()).toBe(false); });
it('preview shows pending', () => { vi.stubEnv('DEV', false); vi.stubEnv('VITE_CONTENT_PREVIEW', 'true');
  expect(visible(items)).toHaveLength(2); });
it('dev shows pending', () => { vi.stubEnv('DEV', true); expect(isVisible({ status: 'pending' })).toBe(true); });
it('slotValue never returns a pending value', () =>
  expect(slotValue({ label: 'x', status: 'pending', value: 'draft' })).toBeUndefined());
