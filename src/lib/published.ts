import type { Slot, Status } from '../types/content';

/** Pending content shows in dev and in preview builds (VITE_CONTENT_PREVIEW=true), never in production. */
export function showPending(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_CONTENT_PREVIEW === 'true';
}

export function isVisible(item: { status: Status }): boolean {
  return item.status === 'published' || showPending();
}

export function visible<T extends { status: Status }>(items: readonly T[]): T[] {
  return items.filter(isVisible);
}

/** The slot value, only when the slot is published. Pending drafts are never returned. */
export function slotValue<T>(slot: Slot<T>): T | undefined {
  return slot.status === 'published' ? slot.value : undefined;
}

export function isSlotVisible(slot: Slot<unknown>): boolean {
  return isVisible(slot);
}
