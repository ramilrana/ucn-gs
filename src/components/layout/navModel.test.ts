import { describe, expect, it } from 'vitest';
import { buildRouteManifest, type RouteEntry } from '../../content/routes';
import type { Area, Recommendation, Resource } from '../../types/content';
import { buildNavModel, isActive, type NavItem } from './navModel';

const doc: Resource = { id: 'doc', title: 'Doc', format: 'pdf', status: 'pending' };
const makeArea = (slug: string, order: number): Area => ({
  slug,
  order,
  title: `Area ${slug}`,
  status: 'published',
  gallery: { label: 'Gallery', status: 'pending' },
  narrativeReport: doc,
  groups: [],
  additionalFiles: [],
});
const makeRec = (number: number): Recommendation => ({
  number,
  title: `Rec ${number}`,
  status: 'published',
  document: doc,
  evidence: [],
  additionalFiles: [],
});

const full = buildRouteManifest({
  areas: [makeArea('research', 1), makeArea('extension', 2)],
  recommendations: [makeRec(1), makeRec(2)],
  includePending: true,
});
const empty = buildRouteManifest({ areas: [], recommendations: [], includePending: false });

function item(items: NavItem[], label: string): NavItem {
  const found = items.find((i) => i.label === label);
  if (!found) throw new Error(`missing nav item ${label}`);
  return found;
}

describe('buildNavModel', () => {
  it('builds the six top-level items in order', () => {
    const nav = buildNavModel(full, 'Accreditation Areas');
    expect(nav.map((i) => [i.label, i.path])).toEqual([
      ['Home', '/'],
      ['Accreditation Areas', '/accreditation-areas'],
      ['Compliance Report', '/compliance-report'],
      ['AVP', '/avp'],
      ['Documents', '/certificate-of-authenticity'],
      ['About', '/about'],
    ]);
    expect(nav[0]?.children).toBeUndefined();
    expect(nav[3]?.children).toBeUndefined();
    expect(item(nav, 'Accreditation Areas').children?.map((c) => c.path)).toEqual([
      '/accreditation-areas/research',
      '/accreditation-areas/extension',
    ]);
    expect(item(nav, 'Documents').children?.map((c) => c.label)).toEqual([
      'Certificate of Authenticity',
      'Additional Files for the Accreditors',
    ]);
    expect(item(nav, 'About').children?.map((c) => c.label)).toEqual([
      'About the Graduate School',
      'Faculty, Staff and Student Assistants',
      'Faculty by Department',
      'FAQs and Location',
    ]);
  });

  it('uses the supplied areas label', () => {
    expect(buildNavModel(full, 'Accreditation Scope')[1]?.label).toBe('Accreditation Scope');
  });

  it('omits children for a group with zero visible areas but keeps the index link', () => {
    const nav = buildNavModel(empty, 'Accreditation Areas');
    const areas = item(nav, 'Accreditation Areas');
    expect(areas.path).toBe('/accreditation-areas');
    expect('children' in areas).toBe(false);
    const compliance = item(nav, 'Compliance Report');
    expect(compliance.path).toBe('/compliance-report');
    expect('children' in compliance).toBe(false);
    expect(nav.some((i) => i.children?.length === 0)).toBe(false);
  });

  it('lists recommendations in number order', () => {
    const shuffled: RouteEntry[] = [3, 1, 2].map((n) => ({
      path: `/compliance-report/recommendation-${n}`,
      title: `Recommendation ${n}`,
      kind: 'recommendation',
      parentPath: '/compliance-report',
      number: n,
    }));
    const nav = buildNavModel([...empty, ...shuffled], 'Accreditation Areas');
    expect(item(nav, 'Compliance Report').children?.map((c) => c.label)).toEqual([
      'Recommendation 1',
      'Recommendation 2',
      'Recommendation 3',
    ]);
  });

  it('does not put the dev-only content status page in the nav', () => {
    const paths = buildNavModel(full, 'Accreditation Areas').flatMap((i) => [
      i.path,
      ...(i.children ?? []).map((c) => c.path),
    ]);
    expect(paths).not.toContain('/content-status');
  });
});

describe('isActive', () => {
  const nav = buildNavModel(full, 'Accreditation Areas');

  it('matches descendants but Home only exactly', () => {
    const home = item(nav, 'Home');
    expect(isActive(home, '/')).toBe(true);
    expect(isActive(home, '/about')).toBe(false);
    expect(isActive(home, '/accreditation-areas/research')).toBe(false);

    const compliance = item(nav, 'Compliance Report');
    expect(isActive(compliance, '/compliance-report')).toBe(true);
    expect(isActive(compliance, '/compliance-report/recommendation-1')).toBe(true);
    expect(isActive(compliance, '/compliance-reports')).toBe(false);
    expect(isActive(compliance, '/about')).toBe(false);

    const documents = item(nav, 'Documents');
    expect(isActive(documents, '/additional-files')).toBe(true);
    expect(isActive(documents, '/certificate-of-authenticity')).toBe(true);
    expect(isActive(item(nav, 'About'), '/about/faculty-by-department')).toBe(true);
  });

  it('ignores a trailing slash', () => {
    expect(isActive(item(nav, 'Compliance Report'), '/compliance-report/')).toBe(true);
  });
});
