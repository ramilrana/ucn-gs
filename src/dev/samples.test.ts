import { describe, expect, it } from 'vitest';
import { collectIds, collectResources } from '../content/validate';
import { sampleAreas, sampleRecommendations } from './samples';

function only<T>(items: readonly T[]): T {
  const [first] = items;
  if (first === undefined) throw new Error('expected one sample');
  return first;
}

describe('dev samples', () => {
  const all = { sampleAreas, sampleRecommendations };

  it('every id starts with DEV-SAMPLE-', () => {
    const ids = collectIds(all);
    expect(ids.length).toBeGreaterThan(10);
    expect(ids.filter((id) => !id.startsWith('DEV-SAMPLE-'))).toEqual([]);
  });

  it('has one pending sample area and one pending sample recommendation', () => {
    expect(sampleAreas).toHaveLength(1);
    expect(sampleAreas[0]).toMatchObject({ slug: 'sample-area', title: 'Sample area', status: 'pending' });
    expect(sampleRecommendations).toHaveLength(1);
    expect(sampleRecommendations[0]).toMatchObject({ number: 99, title: 'Sample recommendation', status: 'pending' });
  });

  it('the area has a 3-image gallery, a local narrative report and groups Sample 1, 2 and 3', () => {
    const area = only(sampleAreas);
    expect(area.gallery.value?.map((i) => i.alt)).toEqual(['Sample image 1', 'Sample image 2', 'Sample image 3']);
    expect(area.gallery.value?.every((i) => i.src.startsWith('data:image/svg+xml'))).toBe(true);
    expect(area.narrativeReport.source?.kind).toBe('local');
    expect(area.groups.map((g) => g.title)).toEqual(['Sample 1', 'Sample 2', 'Sample 3']);
  });

  it('the recommendation has three evidence groups', () => {
    expect(only(sampleRecommendations).evidence).toHaveLength(3);
  });

  it('sample 3 includes a video whose source is still pending', () => {
    const blocks = only(only(sampleAreas).groups.slice(2)).blocks;
    const video = blocks.find((b) => b.type === 'video');
    expect(video?.type === 'video' && video.resource.source).toBeFalsy();
    expect(blocks.some((b) => b.type === 'resources')).toBe(true);
  });

  it('local sample resources use a path under the site base', () => {
    const local = collectResources(all).filter((r) => r.source?.kind === 'local');
    expect(local.length).toBeGreaterThan(0);
  });
});
