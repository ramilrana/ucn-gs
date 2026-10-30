// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { listRoutePaths } from '../../scripts/route-paths.mjs';
import type { Area, Recommendation, Resource } from '../types/content';
import { contentAreas, contentRecommendations } from './index';
import { buildRouteManifest } from './routes';

const pendingDoc: Resource = { id: 'doc', title: 'Doc', format: 'pdf', status: 'pending' };

const makeArea = (slug: string, status: Area['status']): Area => ({
  slug,
  order: 1,
  title: `Area ${slug}`,
  status,
  gallery: { label: 'Gallery', status: 'pending' },
  narrativeReport: pendingDoc,
  groups: [],
  additionalFiles: [],
});

const makeRec = (number: number, status: Recommendation['status']): Recommendation => ({
  number,
  title: `Rec ${number}`,
  status,
  document: pendingDoc,
  evidence: [],
  additionalFiles: [],
});

describe('buildRouteManifest', () => {
  it('production manifest without content has exactly the 10 static routes', () => {
    const manifest = buildRouteManifest({ areas: [], recommendations: [], includePending: false });
    expect(manifest.map((e) => e.path)).toEqual([
      '/',
      '/accreditation-areas',
      '/compliance-report',
      '/avp',
      '/certificate-of-authenticity',
      '/additional-files',
      '/about',
      '/about/people',
      '/about/faculty-by-department',
      '/about/faqs-and-location',
    ]);
  });

  it('pending area is excluded unless includePending', () => {
    const input = {
      areas: [makeArea('research', 'published'), makeArea('draft', 'pending')],
      recommendations: [makeRec(1, 'published'), makeRec(2, 'pending')],
    };
    const prod = buildRouteManifest({ ...input, includePending: false }).map((e) => e.path);
    expect(prod).toContain('/accreditation-areas/research');
    expect(prod).toContain('/compliance-report/recommendation-1');
    expect(prod).not.toContain('/accreditation-areas/draft');
    expect(prod).not.toContain('/compliance-report/recommendation-2');

    const dev = buildRouteManifest({ ...input, includePending: true }).map((e) => e.path);
    expect(dev).toContain('/accreditation-areas/draft');
    expect(dev).toContain('/compliance-report/recommendation-2');
  });

  it('adds /content-status only when includePending', () => {
    const off = buildRouteManifest({ areas: [], recommendations: [], includePending: false });
    expect(off.some((e) => e.path === '/content-status')).toBe(false);
    const on = buildRouteManifest({ areas: [], recommendations: [], includePending: true });
    expect(on.at(-1)).toMatchObject({
      path: '/content-status',
      title: 'Content status',
      kind: 'content-status',
      devOnly: true,
    });
  });

  it('sets titles, parents, slugs and numbers on generated and nested entries', () => {
    const manifest = buildRouteManifest({
      areas: [makeArea('research', 'published')],
      recommendations: [makeRec(3, 'published')],
      includePending: false,
    });
    const byPath = new Map(manifest.map((e) => [e.path, e]));
    expect(byPath.get('/accreditation-areas/research')).toMatchObject({
      title: 'Area research',
      kind: 'area',
      parentPath: '/accreditation-areas',
      slug: 'research',
    });
    expect(byPath.get('/compliance-report/recommendation-3')).toMatchObject({
      title: 'Recommendation 3',
      kind: 'recommendation',
      parentPath: '/compliance-report',
      number: 3,
    });
    for (const p of ['/about/people', '/about/faculty-by-department', '/about/faqs-and-location']) {
      expect(byPath.get(p)?.parentPath).toBe('/about');
    }
    expect(byPath.get('/certificate-of-authenticity')?.parentPath).toBeUndefined();
    expect(byPath.get('/additional-files')?.parentPath).toBeUndefined();
  });

  it('content-file routes match the server route list', () => {
    // Real content files only: the server route list knows nothing about dev samples.
    const manifest = buildRouteManifest({ areas: contentAreas, recommendations: contentRecommendations, includePending: true });
    const clientPaths = manifest.filter((e) => !e.devOnly).map((e) => e.path);
    expect([...clientPaths].sort()).toEqual([...listRoutePaths('src/content')].sort());
  });
});
