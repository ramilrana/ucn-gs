// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { sampleAreas, sampleRecommendations } from '../../dev/samples';
import type { Area, Faq, Person, Recommendation, Resource } from '../../types/content';
import * as contentIndex from '../../content';
import { people } from '../../content/people';
import { collectPending } from './collectPending';

const content = { ...contentIndex, people };

describe('collectPending', () => {
  it('lists every pending home slot by label', () => {
    const entries = collectPending(content);
    const home = entries.filter((e) => e.page === 'Home');
    expect(home.map((e) => e.label)).toEqual(
      expect.arrayContaining([
        'First accreditation slide',
        'Second accreditation slide',
        'Second slideshow or photo gallery',
        'Graduate School video',
      ]),
    );
    expect(home.every((e) => e.path === '/')).toBe(true);
  });

  it('lists a published message without a photo as a pending photograph', () => {
    const msg = content.home.deanMessage;
    if (msg.status !== 'published') throw new Error('fixture expects a published message');
    const noPhoto = { ...msg.value, photo: undefined };
    const withoutPhoto = { ...content, home: { ...content.home, deanMessage: { ...msg, value: noPhoto } } };
    const labels = collectPending(withoutPhoto).map((e) => e.label);
    expect(labels).toContain("Dean's photograph (message is published)");
    // The real content has all three photos (2026-11-20).
    expect(collectPending(content).map((e) => e.label).filter((l) => l.includes('photograph (message'))).toEqual([]);
  });

  it('reports missing area and recommendation lists', () => {
    const labels = collectPending({ ...content, contentAreas: [], contentRecommendations: [] }).map((e) => e.label);
    expect(labels).toContain('Area list not supplied');
    expect(labels).toContain('Recommendation list not supplied');
  });

  // Minimal real (non-sample) area and recommendation, with one pending item each.
  const pendingDoc = (id: string): Resource => ({
    id,
    title: `Doc ${id}`,
    format: 'pdf',
    status: 'pending',
  });
  const realArea: Area = {
    slug: 'real-area',
    order: 1,
    title: 'Real area',
    status: 'pending',
    gallery: { label: 'Real gallery', status: 'pending' },
    narrativeReport: pendingDoc('real-narrative'),
    groups: [],
    additionalFiles: [],
  };
  const realRec: Recommendation = {
    areaSlug: 'real-area',
    number: 7,
    title: 'Real rec',
    status: 'pending',
    document: pendingDoc('real-rec-doc'),
    evidence: [],
    additionalFiles: [],
  };

  it('does not report the lists as missing once real files exist', () => {
    const labels = collectPending({
      ...content,
      contentAreas: [realArea],
      contentRecommendations: [realRec],
    }).map((e) => e.label);
    expect(labels).not.toContain('Area list not supplied');
    expect(labels).not.toContain('Recommendation list not supplied');
  });

  it('links area and recommendation items to their pages', () => {
    const entries = collectPending({
      ...content,
      contentAreas: [realArea],
      contentRecommendations: [realRec],
    });
    expect(entries.some((e) => e.path === '/accreditation-areas/real-area' && e.label === 'Real gallery')).toBe(true);
    const docEntry = entries.find((e) => e.label === 'Doc real-rec-doc');
    expect(docEntry).toMatchObject({
      path: '/compliance-report/real-area/recommendation-7',
      page: 'Real area: Recommendation 7',
    });
  });

  it('excludes DEV-SAMPLE items', () => {
    const samplePerson: Person = {
      id: 'DEV-SAMPLE-person',
      name: 'Sample person',
      position: 'Sample',
      role: 'faculty',
      status: 'pending',
    };
    const sampleFaq: Faq = {
      id: 'DEV-SAMPLE-faq',
      question: 'Sample question',
      answer: ['x'],
      status: 'pending',
    };
    const entries = collectPending({
      ...content,
      people: [samplePerson],
      faqs: [sampleFaq],
      contentAreas: sampleAreas,
      contentRecommendations: sampleRecommendations,
    });
    const text = JSON.stringify(entries);
    expect(text).not.toMatch(/sample/i);
    // The two "not supplied" entries still appear, because samples are not real files.
    expect(entries.map((e) => e.label)).toContain('Area list not supplied');
  });

  it('lists pending people and FAQs that are not samples', () => {
    const person: Person = {
      id: 'p1',
      name: 'A. Person',
      position: 'Dean',
      role: 'official',
      status: 'pending',
    };
    const faq: Faq = {
      id: 'f1',
      question: 'Where is the office?',
      answer: [],
      status: 'pending',
    };
    const entries = collectPending({
      ...content,
      people: [person],
      faqs: [faq],
    });
    expect(entries.some((e) => e.label.includes('A. Person') && e.path === '/about/people')).toBe(true);
    expect(entries.some((e) => e.label.includes('Where is the office?') && e.path === '/about/faqs-and-location')).toBe(
      true,
    );
  });
});
