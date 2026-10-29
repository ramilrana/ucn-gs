// @vitest-environment node
import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Area, ImageAsset, Person, Recommendation, Resource } from '../types/content';
import * as content from './index';
import {
  checkFilenames,
  checkIds,
  checkImages,
  checkPeople,
  checkResources,
  checkSlugs,
  collectIds,
  collectImages,
  collectPeople,
  collectResources,
} from './validate';

// Filenames are checked against the raw glob keys, independent of index.ts.
const areaModules = import.meta.glob<Area>(['./areas/*.ts', '!./areas/*.test.ts'], { eager: true, import: 'default' });
const recModules = import.meta.glob<Recommendation>(['./recommendations/rec-*.ts', '!./recommendations/*.test.ts'], {
  eager: true,
  import: 'default',
});

const publicFileExists = (path: string) => existsSync(new URL(`../../public${path}`, import.meta.url));

const DRIVE_ID = 'A'.repeat(33);
const published = (over: Partial<Resource> & { source?: Resource['source'] }): Resource =>
  ({ id: 'r', title: 'R', format: 'pdf', status: 'published', source: { kind: 'external', url: 'https://example.org/a.pdf' }, ...over }) as Resource;
const person = (over: Partial<Person> = {}): Person => ({
  id: 'p1', name: 'N', position: 'P', role: 'faculty', status: 'published', ...over,
});
const image = (over: Partial<ImageAsset> = {}): ImageAsset => ({ src: '/a.jpg', width: 1, height: 1, alt: 'x', ...over });

describe('content (real data)', () => {
  const resources = collectResources(content);

  it('has unique ids across resources, evidence groups, people, FAQs and resource groups', () => {
    expect(checkIds(collectIds(content))).toEqual([]);
  });
  it('local source paths exist under public/', () => {
    expect(checkResources(resources, publicFileExists).filter((m) => m.includes('local file'))).toEqual([]);
  });
  it('drive and youtube IDs are well formed', () => {
    expect(checkResources(resources, publicFileExists).filter((m) => m.includes('ID'))).toEqual([]);
  });
  it('external URLs are https and not google redirects', () => {
    expect(checkResources(resources, publicFileExists).filter((m) => m.includes('external'))).toEqual([]);
  });
  it('published resources have a source', () => {
    expect(checkResources(resources, publicFileExists).filter((m) => m.includes('no source'))).toEqual([]);
  });
  it('all resource rules pass together', () => {
    expect(checkResources(resources, publicFileExists)).toEqual([]);
  });
  it('published people have a name and position', () => {
    expect(checkPeople(collectPeople(content))).toEqual([]);
  });
  it('published images have alt text', () => {
    expect(checkImages(collectImages(content))).toEqual([]);
  });
  it('area and recommendation filenames match their slug and number', () => {
    expect(checkFilenames(areaModules, recModules)).toEqual([]);
  });
  it('area slugs are lowercase kebab-case', () => {
    expect(checkSlugs(Object.values(areaModules).map((a) => a.slug))).toEqual([]);
  });
  it('the glob sees every area and recommendation file on disk', () => {
    // Guards against a stale module-transform cache hiding a newly added file.
    const onDisk = (dir: string, re: RegExp) =>
      readdirSync(new URL(`./${dir}/`, import.meta.url)).filter((n) => re.test(n)).map((n) => `./${dir}/${n}`).sort();
    expect(Object.keys(areaModules).sort()).toEqual(onDisk('areas', /^(?!.*\.test\.ts$).+\.ts$/));
    expect(Object.keys(recModules).sort()).toEqual(onDisk('recommendations', /^rec-.*\.ts$/));
  });
  it('exports the documented shape', () => {
    expect(content.site.universityName).toBe('University of Camarines Norte');
    expect(content.home.accreditationHeading).toBe('LEVEL IV AACCUP ACCREDITATION');
    expect(Array.isArray(content.areas)).toBe(true);
    expect(Array.isArray(content.recommendations)).toBe(true);
  });
});

describe('rejects a bad fixture', () => {
  it('duplicate ids', () => {
    expect(checkIds(['a', 'b', 'a']).length).toBeGreaterThan(0);
    expect(checkIds(['a', 'b'])).toEqual([]);
  });
  it('missing local file', () => {
    const bad = published({ id: 'x', source: { kind: 'local', path: '/files/nope.pdf' } });
    expect(checkResources([bad], () => false).join()).toContain('local file');
    expect(checkResources([bad], () => true)).toEqual([]);
  });
  it('bad drive and youtube ids', () => {
    const d = published({ id: 'd', source: { kind: 'drive', fileId: 'short' } });
    const f = published({ id: 'f', source: { kind: 'drive-folder', folderId: 'short' } });
    const y = published({ id: 'y', source: { kind: 'youtube', videoId: 'x' } });
    expect(checkResources([d, f, y], () => true)).toHaveLength(3);
    const ok = published({ id: 'd2', source: { kind: 'drive', fileId: DRIVE_ID } });
    expect(checkResources([ok], () => true)).toEqual([]);
  });
  it('bad external urls', () => {
    for (const url of ['http://example.org/a', 'javascript:alert(1)', 'https://www.google.com/url?q=https://x.org', 'mailto:a@b.c']) {
      const bad = published({ id: 'e', source: { kind: 'external', url } });
      expect(checkResources([bad], () => true), url).not.toEqual([]);
    }
  });
  it('published resource without a source', () => {
    const bad = { id: 'n', title: 'N', format: 'pdf', status: 'published' } as unknown as Resource;
    expect(checkResources([bad], () => true).join()).toContain('no source');
    expect(checkResources([{ ...bad, status: 'pending' } as Resource], () => true)).toEqual([]);
  });
  it('published person without name or position', () => {
    expect(checkPeople([person({ name: ' ' })])).toHaveLength(1);
    expect(checkPeople([person({ position: '' })])).toHaveLength(1);
    expect(checkPeople([person({ name: '', position: '', status: 'pending' })])).toEqual([]);
    expect(checkPeople([person()])).toEqual([]);
  });
  it('published image without alt', () => {
    expect(checkImages([{ where: 'home.gallery', image: image({ alt: '  ' }) }])).toHaveLength(1);
    expect(checkImages([{ where: 'home.gallery', image: image() }])).toEqual([]);
  });
  it('mismatched filenames', () => {
    expect(checkFilenames({ './areas/research.ts': { slug: 'teaching' } }, {})).toHaveLength(1);
    expect(checkFilenames({ './areas/research.ts': { slug: 'research' } }, {})).toEqual([]);
    expect(checkFilenames({}, { './recommendations/rec-03.ts': { number: 4 } })).toHaveLength(1);
    expect(checkFilenames({}, { './recommendations/rec-03.ts': { number: 3 } })).toEqual([]);
    expect(checkFilenames({}, { './recommendations/rec-x.ts': { number: 3 } })).toHaveLength(1);
  });
  it('bad area slugs', () => {
    for (const s of ['Research', 'a_b', '-a', 'a-', 'a--b', 'a b', '']) {
      expect(checkSlugs([s]), s).toHaveLength(1);
    }
    expect(checkSlugs(['research', 'teaching-and-learning', 'area-2'])).toEqual([]);
  });
});
