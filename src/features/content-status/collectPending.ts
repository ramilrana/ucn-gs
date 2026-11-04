import type * as ContentModule from '../../content';
import type { Area, EvidenceGroup, Recommendation, Resource, Slot, Status } from '../../types/content';

export interface PendingEntry {
  /** Page name shown in the table. */
  page: string;
  /** Root-relative route of that page. */
  path: string;
  /** What is missing. */
  label: string;
}

type Content = typeof ContentModule;

// Id prefix of every item in src/dev/samples.ts. This page is dead code in production (showPending() is
// false), so the literal is dropped from dist/; `npm run check:dist` fails if that ever stops being true.
const SAMPLE_PREFIX = 'DEV-SAMPLE-';
const isSample = (id: string): boolean => id.startsWith(SAMPLE_PREFIX);

const AREAS_PATH = '/accreditation-areas';
const COMPLIANCE_PATH = '/compliance-report';

/** Collects entries for one page. Every method skips sample ids and anything that is not pending. */
function createCollector(page: string, path: string, out: PendingEntry[]) {
  const add = (label: string) => out.push({ page, path, label });
  const resource = (r: Resource) => {
    if (r.status === 'pending' && !isSample(r.id)) add(r.title);
  };
  const slot = (s: Slot<unknown>) => {
    if (s.status === 'pending') add(s.label);
  };
  const group = (g: EvidenceGroup) => {
    if (isSample(g.id)) return;
    if (g.status === 'pending') add(`${g.title} (group)`);
    for (const block of g.blocks) {
      if (block.type === 'document' || block.type === 'video') resource(block.resource);
      else if (block.type === 'resources') block.items.forEach(resource);
    }
  };
  return { add, resource, slot, group };
}

function collectArea(area: Area, out: PendingEntry[]): void {
  // An area with a sample narrative report is a sample area, whatever its slug.
  if (isSample(area.narrativeReport.id)) return;
  const c = createCollector(`Area: ${area.title}`, `${AREAS_PATH}/${area.slug}`, out);
  if (area.status === 'pending') c.add('Area page (not yet published)');
  c.slot(area.gallery);
  c.resource(area.narrativeReport);
  area.groups.forEach(c.group);
  area.additionalFiles.forEach(c.resource);
  if (area.avp) c.resource(area.avp);
}

function collectRecommendation(rec: Recommendation, out: PendingEntry[]): void {
  if (isSample(rec.document.id)) return;
  const c = createCollector(`Recommendation ${rec.number}`, `${COMPLIANCE_PATH}/recommendation-${rec.number}`, out);
  if (rec.status === 'pending') c.add('Recommendation page (not yet published)');
  c.resource(rec.document);
  rec.evidence.forEach(c.group);
  rec.additionalFiles.forEach(c.resource);
}

const isPending = (item: { status: Status }): boolean => item.status === 'pending';

/**
 * Everything on the site that is still pending: slots, resources, groups, people and FAQs.
 * Dev samples (ids starting with `DEV-SAMPLE-`) are skipped. Areas and recommendations are read from
 * `contentAreas` and `contentRecommendations`, the content files only, so a missing list is reported.
 */
export function collectPending(content: Content): PendingEntry[] {
  const out: PendingEntry[] = [];

  const site = createCollector('Site-wide', '/', out);
  site.slot(content.site.programName);
  const location = createCollector('FAQs and location', '/about/faqs-and-location', out);
  location.slot(content.site.contact);
  location.slot(content.site.mapQuery);

  const home = createCollector('Home', '/', out);
  const h = content.home;
  home.slot(h.leadershipSlides);
  home.slot(h.accreditationSlide1);
  home.slot(h.accreditationSlide2);
  home.slot(h.gallery);
  home.resource(h.video);
  home.slot(h.deanMessage);
  home.slot(h.programChairMessage);

  const about = createCollector('About', '/about', out);
  const a = content.about;
  for (const s of [a.photo, a.mission, a.vision, a.goals, a.objectives, a.history]) about.slot(s);

  const faculty = createCollector('Faculty by department', '/about/faculty-by-department', out);
  const people = createCollector('People', '/about/people', out);
  for (const p of content.people) {
    if (isSample(p.id) || !isPending(p)) continue;
    const label = `Person: ${p.name.trim() || p.id}`;
    (p.role === 'faculty' ? faculty : people).add(label);
  }

  const faqs = createCollector('FAQs and location', '/about/faqs-and-location', out);
  for (const faq of content.faqs) {
    if (!isSample(faq.id) && isPending(faq)) faqs.add(`FAQ: ${faq.question}`);
  }

  const certificate = createCollector('Certificate of Authenticity', '/certificate-of-authenticity', out);
  certificate.resource(content.certificate.pdf);
  certificate.slot(content.certificate.image);

  const files = createCollector('Additional files', '/additional-files', out);
  for (const g of content.additionalFiles) {
    if (isSample(g.id)) continue;
    if (isPending(g)) files.add(`${g.title} (group)`);
    g.items.forEach(files.resource);
  }

  createCollector('Compliance Report', COMPLIANCE_PATH, out).slot(content.compliance.overview);

  const realAreas = content.contentAreas.filter((area) => !isSample(area.narrativeReport.id));
  if (realAreas.length === 0) out.push({ page: 'Accreditation Areas', path: AREAS_PATH, label: 'Area list not supplied' });
  realAreas.forEach((area) => collectArea(area, out));

  const realRecs = content.contentRecommendations.filter((rec) => !isSample(rec.document.id));
  if (realRecs.length === 0) {
    out.push({ page: 'Compliance Report', path: COMPLIANCE_PATH, label: 'Recommendation list not supplied' });
  }
  realRecs.forEach((rec) => collectRecommendation(rec, out));

  return out;
}
