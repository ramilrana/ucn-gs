// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { sampleAreas, sampleRecommendations } from '../../dev/samples';
import type { Area, Faq, Person, Recommendation, Resource, ResourceGroup } from '../../types/content';
import * as content from '../../content';
import { collectPending } from './collectPending';

describe('collectPending', () => {
  it('lists every pending home slot by label', () => {
    const entries = collectPending(content);
    const home = entries.filter((e) => e.page === 'Home');
    expect(home.map((e) => e.label)).toEqual(
      expect.arrayContaining([
        'Leadership photographs (President, Dean, faculty)',
        'First accreditation slide',
        'Second accreditation slide',
        'Second slideshow or photo gallery',
        'Graduate School video',
        "Dean's photograph and message",
        "Program Chair's photograph and message",
      ]),
    );
    expect(home.every((e) => e.path === '/')).toBe(true);
  });

  it('reports missing area and recommendation lists', () => {
    const labels = collectPending(content).map((e) => e.label);
    expect(labels).toContain('Area list not supplied');
    expect(labels).toContain('Recommendation list not supplied');
  });

  // Minimal real (non-sample) area and recommendation, with one pending item each.
  const pendingDoc = (id: string): Resource => ({ id, title: `Doc ${id}`, format: 'pdf', status: 'pending' });
  const realArea: Area = {
    slug: 'real-area', order: 1, title: 'Real area', status: 'pending',
    gallery: { label: 'Real gallery', status: 'pending' },
    narrativeReport: pendingDoc('real-narrative'), groups: [], additionalFiles: [],
  };
  const realRec: Recommendation = {
    number: 7, title: 'Real rec', status: 'pending', document: pendingDoc('real-rec-doc'), evidence: [], additionalFiles: [],
  };

  it('does not report the lists as missing once real files exist', () => {
    const labels = collectPending({ ...content, contentAreas: [realArea], contentRecommendations: [realRec] }).map((e) => e.label);
    expect(labels).not.toContain('Area list not supplied');
    expect(labels).not.toContain('Recommendation list not supplied');
  });

  it('links area and recommendation items to their pages', () => {
    const entries = collectPending({ ...content, contentAreas: [realArea], contentRecommendations: [realRec] });
    expect(entries.some((e) => e.path === '/accreditation-areas/real-area' && e.label === 'Real gallery')).toBe(true);
    expect(entries.some((e) => e.path === '/compliance-report/recommendation-7' && e.label === 'Doc real-rec-doc')).toBe(true);
  });

  it('excludes DEV-SAMPLE items', () => {
    const samplePerson: Person = { id: 'DEV-SAMPLE-person', name: 'Sample person', position: 'Sample', role: 'faculty', status: 'pending' };
    const sampleFaq: Faq = { id: 'DEV-SAMPLE-faq', question: 'Sample question', answer: ['x'], status: 'pending' };
    const sampleGroup: ResourceGroup = {
      id: 'DEV-SAMPLE-files',
      title: 'Sample files',
      status: 'pending',
      items: [{ id: 'DEV-SAMPLE-file', title: 'Sample file', format: 'pdf', status: 'pending' }],
    };
    const entries = collectPending({
      ...content,
      people: [samplePerson],
      faqs: [sampleFaq],
      additionalFiles: [sampleGroup],
      contentAreas: sampleAreas,
      contentRecommendations: sampleRecommendations,
    });
    const text = JSON.stringify(entries);
    expect(text).not.toMatch(/sample/i);
    // The two "not supplied" entries still appear, because samples are not real files.
    expect(entries.map((e) => e.label)).toContain('Area list not supplied');
  });

  it('lists pending people and FAQs that are not samples', () => {
    const person: Person = { id: 'p1', name: 'A. Person', position: 'Dean', role: 'official', status: 'pending' };
    const faq: Faq = { id: 'f1', question: 'Where is the office?', answer: [], status: 'pending' };
    const entries = collectPending({ ...content, people: [person], faqs: [faq] });
    expect(entries.some((e) => e.label.includes('A. Person') && e.path === '/about/people')).toBe(true);
    expect(entries.some((e) => e.label.includes('Where is the office?') && e.path === '/about/faqs-and-location')).toBe(true);
  });
});
