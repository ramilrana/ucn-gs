// Pure content rules. Each check returns a list of messages; an empty list means the rule holds.
import { isDriveId, isYouTubeId } from '../lib/resourceUrls';
import { safeHref } from '../lib/safeUrl';
import type { EvidenceBlock, ImageAsset, Person, Resource, ResourceFormat } from '../types/content';

const FORMATS: readonly ResourceFormat[] = ['pdf', 'image', 'video', 'folder', 'doc', 'link'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Visits every object reachable from `root` once, so shared objects and cycles are safe.
 * When `skip` returns true for an object, that object is not visited and its subtree is not entered.
 */
function walk(
  root: unknown,
  visit: (node: Record<string, unknown>) => void,
  skip?: (node: Record<string, unknown>) => boolean,
): void {
  const seen = new Set<object>();
  const stack: unknown[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!isRecord(node) || seen.has(node)) continue;
    seen.add(node);
    if (!Array.isArray(node)) {
      if (skip?.(node)) continue;
      visit(node);
    }
    stack.push(...Object.values(node));
  }
}

function isResource(node: Record<string, unknown>): boolean {
  return (
    typeof node.id === 'string' &&
    typeof node.title === 'string' &&
    typeof node.format === 'string' &&
    (FORMATS as readonly string[]).includes(node.format)
  );
}

/** Every Resource reachable from `root`. */
export function collectResources(root: unknown): Resource[] {
  const found: Resource[] = [];
  walk(root, (node) => {
    if (isResource(node)) found.push(node as unknown as Resource);
  });
  return found;
}

/**
 * Published resources that have a source, skipping every pending subtree: a pending area, evidence
 * group, person, slot or resource hides everything inside it, including resources marked published.
 */
export function collectPublishedResources(root: unknown): Resource[] {
  const found: Resource[] = [];
  walk(
    root,
    (node) => {
      if (isResource(node) && node.status === 'published' && node.source) found.push(node as unknown as Resource);
    },
    (node) => node.status === 'pending',
  );
  return found;
}

/** Every string `id` reachable from `root`: resources, evidence groups, people, FAQs and resource groups. */
export function collectIds(root: unknown): string[] {
  const ids: string[] = [];
  walk(root, (node) => {
    if (typeof node.id === 'string') ids.push(node.id);
  });
  return ids;
}

/** Every Person reachable from `root` (an object with id, name, position and role). */
export function collectPeople(root: unknown): Person[] {
  const found: Person[] = [];
  walk(root, (node) => {
    if (typeof node.id === 'string' && 'name' in node && 'position' in node && 'role' in node) {
      found.push(node as unknown as Person);
    }
  });
  return found;
}

export interface LocatedImage { where: string; image: ImageAsset }

interface SlotLike<T> { status: string; value?: T }
interface GroupLike { status: string; blocks: readonly EvidenceBlock[] }
interface ImageSources {
  home?: {
    leadershipSlides?: SlotLike<ImageAsset[]>;
    accreditationSlide1?: SlotLike<ImageAsset>;
    accreditationSlide2?: SlotLike<ImageAsset>;
    gallery?: SlotLike<ImageAsset[]>;
  };
  people?: readonly Person[];
  areas?: ReadonlyArray<{ slug: string; status: string; gallery?: SlotLike<ImageAsset[]>; groups?: readonly GroupLike[] }>;
  recommendations?: ReadonlyArray<{ number: number; status: string; evidence?: readonly GroupLike[] }>;
}

/**
 * Published images that must carry alt text: Home slides and galleries, area and evidence galleries,
 * and person photos. Images inside pending slots, groups, areas or people are not collected.
 */
export function collectImages(content: ImageSources): LocatedImage[] {
  const out: LocatedImage[] = [];
  const one = (where: string, slot?: SlotLike<ImageAsset>) => {
    if (slot?.status === 'published' && slot.value) out.push({ where, image: slot.value });
  };
  const many = (where: string, slot?: SlotLike<ImageAsset[]>) => {
    if (slot?.status === 'published') (slot.value ?? []).forEach((image, i) => out.push({ where: `${where}[${i}]`, image }));
  };
  const evidence = (where: string, groups: readonly GroupLike[] = []) => {
    groups.forEach((group, g) => {
      if (group.status !== 'published') return;
      group.blocks.forEach((block, b) => {
        if (block.type !== 'gallery') return;
        block.images.forEach((image, i) => out.push({ where: `${where}.groups[${g}].blocks[${b}][${i}]`, image }));
      });
    });
  };

  many('home.leadershipSlides', content.home?.leadershipSlides);
  one('home.accreditationSlide1', content.home?.accreditationSlide1);
  one('home.accreditationSlide2', content.home?.accreditationSlide2);
  many('home.gallery', content.home?.gallery);
  for (const p of content.people ?? []) {
    if (p.status === 'published' && p.photo) out.push({ where: `person ${p.id} photo`, image: p.photo });
  }
  for (const area of content.areas ?? []) {
    if (area.status !== 'published') continue;
    many(`area ${area.slug} gallery`, area.gallery);
    evidence(`area ${area.slug}`, area.groups);
  }
  for (const rec of content.recommendations ?? []) {
    if (rec.status === 'published') evidence(`recommendation ${rec.number}`, rec.evidence);
  }
  return out;
}

/** Rule 1: ids are unique. */
export function checkIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) (seen.has(id) ? dupes : seen).add(id);
  return [...dupes].map((id) => `duplicate id "${id}"`);
}

/** Rules 2 to 5: resource sources. */
export function checkResources(resources: readonly Resource[], fileExists: (publicPath: string) => boolean): string[] {
  const errors: string[] = [];
  for (const r of resources) {
    const at = `resource "${r.id}"`;
    const s = r.source;
    if (!s) {
      if (r.status === 'published') errors.push(`${at} is published but has no source`);
      continue;
    }
    switch (s.kind) {
      case 'local':
        if (!fileExists(s.path)) errors.push(`${at} local file public${s.path} does not exist`);
        break;
      case 'drive':
        if (!isDriveId(s.fileId)) errors.push(`${at} has an invalid Drive ID`);
        break;
      case 'drive-folder':
        if (!isDriveId(s.folderId)) errors.push(`${at} has an invalid Drive folder ID`);
        break;
      case 'youtube':
        if (!isYouTubeId(s.videoId)) errors.push(`${at} has an invalid YouTube ID`);
        break;
      case 'external':
        if (safeHref(s.url) === null || !s.url.startsWith('https:')) {
          errors.push(`${at} external URL must be a safe https: URL`);
        } else if (s.url.startsWith('https://www.google.com/url')) {
          errors.push(`${at} external URL is a google.com redirect, use the real target`);
        }
        break;
    }
  }
  return errors;
}

/** Rule 6: published people have a name and position. */
export function checkPeople(people: readonly Person[]): string[] {
  const errors: string[] = [];
  for (const p of people) {
    if (p.status !== 'published') continue;
    if (!p.name.trim()) errors.push(`person "${p.id}" has an empty name`);
    if (!p.position.trim()) errors.push(`person "${p.id}" has an empty position`);
  }
  return errors;
}

/** Rule 7: published images have alt text. */
export function checkImages(images: readonly LocatedImage[]): string[] {
  return images.filter(({ image }) => !image.alt.trim()).map(({ where }) => `image at ${where} has empty alt text`);
}

/** Rule 8: file basenames match slug and number. Keys are import.meta.glob keys. */
export function checkFilenames(
  areaModules: Readonly<Record<string, { slug: string }>>,
  recModules: Readonly<Record<string, { number: number }>>,
): string[] {
  const errors: string[] = [];
  for (const [key, mod] of Object.entries(areaModules)) {
    const base = key.split('/').pop()?.replace(/\.ts$/, '');
    if (base !== mod.slug) errors.push(`area file ${key} must have slug "${base}", found "${mod.slug}"`);
  }
  for (const [key, mod] of Object.entries(recModules)) {
    const match = /rec-(\d+)\.ts$/.exec(key);
    if (!match) errors.push(`recommendation file ${key} must be named rec-NN.ts`);
    else if (Number(match[1]) !== mod.number) {
      errors.push(`recommendation file ${key} must have number ${Number(match[1])}, found ${mod.number}`);
    }
  }
  return errors;
}

/** Rule 9: area slugs are lowercase kebab-case. */
export function checkSlugs(slugs: readonly string[]): string[] {
  return slugs.filter((s) => !SLUG.test(s)).map((s) => `area slug "${s}" must match ${SLUG}`);
}
