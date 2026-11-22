import { describe, expect, it } from 'vitest';
import { buildRouteManifest } from '../../content/routes';
import type { Area, Recommendation, Resource } from '../../types/content';
import { buildNavModel, isActive, type NavItem } from './navModel';

const doc: Resource = {
  id: 'doc',
  title: 'Doc',
  format: 'pdf',
  status: 'pending',
};
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
const makeRec = (number: number, areaSlug = 'research'): Recommendation => ({
  areaSlug,
  number,
  title: `Rec ${number}`,
  status: 'published',
  document: doc,
  evidence: [],
  additionalFiles: [],
});

const full = buildRouteManifest({
  areas: [makeArea('research', 1), makeArea('extension', 2)],
  recommendations: [makeRec(1), makeRec(2), makeRec(1, 'extension')],
  includePending: true,
});
const empty = buildRouteManifest({
  areas: [],
  recommendations: [],
  includePending: false,
});

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
      ['Certificate of Authenticity', '/certificate-of-authenticity'],
      ['Compliance Report', '/compliance-report'],
      ['Accreditation Areas', '/accreditation-areas'],
      ['AVP', '/avp'],
      ['About', '/about'],
    ]);
    expect(nav[0]?.children).toBeUndefined();
    // The certificate is a single page now (Additional Files removed 2026-11-20), so no dropdown.
    expect(nav[1]?.children).toBeUndefined();
    expect(nav[4]?.children).toBeUndefined();
    expect(item(nav, 'Accreditation Areas').children?.map((c) => c.path)).toEqual([
      '/accreditation-areas/research',
      '/accreditation-areas/extension',
    ]);
    expect(item(nav, 'About').children?.map((c) => c.label)).toEqual([
      'About the Graduate School',
      'Faculty, Staff and Student Assistants',
      'Faculty of Programs',
      'FAQs and Location',
    ]);
  });

  it('uses the supplied areas label', () => {
    expect(buildNavModel(full, 'Accreditation Scope').find((i) => i.path === '/accreditation-areas')?.label).toBe(
      'Accreditation Scope',
    );
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

  it('lists one anchor per area that has recommendations, in manifest order', () => {
    const nav = buildNavModel(full, 'Accreditation Areas');
    expect(item(nav, 'Compliance Report').children).toEqual([
      {
        label: 'Area research',
        path: '/compliance-report#research',
        srSuffix: 'recommendations',
        children: [
          { label: 'Recommendation 1', path: '/compliance-report/research/recommendation-1', srSuffix: '(Area research)' },
          { label: 'Recommendation 2', path: '/compliance-report/research/recommendation-2', srSuffix: '(Area research)' },
        ],
      },
      {
        label: 'Area extension',
        path: '/compliance-report#extension',
        srSuffix: 'recommendations',
        children: [
          { label: 'Recommendation 1', path: '/compliance-report/extension/recommendation-1', srSuffix: '(Area extension)' },
        ],
      },
    ]);
  });

  it('marks Compliance Report active on a recommendation page reached through the third level', () => {
    const compliance = item(buildNavModel(full, 'Accreditation Areas'), 'Compliance Report');
    expect(isActive(compliance, '/compliance-report/extension/recommendation-1')).toBe(true);
  });

  it('omits areas without recommendations and keeps the index link when none have any', () => {
    const manifest = buildRouteManifest({
      areas: [makeArea('research', 1), makeArea('extension', 2)],
      recommendations: [makeRec(1, 'extension')],
      includePending: false,
    });
    const compliance = item(buildNavModel(manifest, 'Accreditation Areas'), 'Compliance Report');
    expect(compliance.children?.map((c) => c.label)).toEqual(['Area extension']);
    const noRecs = buildRouteManifest({
      areas: [makeArea('research', 1)],
      recommendations: [],
      includePending: false,
    });
    expect('children' in item(buildNavModel(noRecs, 'Accreditation Areas'), 'Compliance Report')).toBe(false);
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
    expect(isActive(compliance, '/compliance-report/research/recommendation-1')).toBe(true);
    expect(isActive(compliance, '/compliance-reports')).toBe(false);
    expect(isActive(compliance, '/about')).toBe(false);

    const certificate = item(nav, 'Certificate of Authenticity');
    expect(isActive(certificate, '/certificate-of-authenticity')).toBe(true);
    expect(isActive(certificate, '/additional-files')).toBe(false);
    expect(isActive(item(nav, 'About'), '/about/faculty-of-programs')).toBe(true);
  });

  it('ignores a trailing slash', () => {
    expect(isActive(item(nav, 'Compliance Report'), '/compliance-report/')).toBe(true);
  });
});
