import { recommendationPath, recommendationTitle } from '../../content/routes';
import type * as ContentModule from '../../content';
import type {
  AboutContent,
  Area,
  EvidenceGroup,
  HomeContent,
  Person,
  ProgramFaculty,
  Recommendation,
  Resource,
  Slot,
  Status,
} from '../../types/content';

export interface PendingEntry {
  /** Page name shown in the table. */
  page: string;
  /** Root-relative route of that page. */
  path: string;
  /** What is missing. */
  label: string;
}

/** The content index plus `home`, `about`, `people` and `facultyOfPrograms`, which the index leaves out of the first-load bundle. */
type Content = typeof ContentModule & {
  home: HomeContent;
  about: AboutContent;
  people: readonly Person[];
  facultyOfPrograms: Slot<ProgramFaculty[]>;
};

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

function collectRecommendation(rec: Recommendation, areas: readonly Area[], out: PendingEntry[]): void {
  if (isSample(rec.document.id)) return;
  const areaTitle = areas.find((a) => a.slug === rec.areaSlug)?.title ?? rec.areaSlug;
  const c = createCollector(
    recommendationTitle(areaTitle, rec.number),
    recommendationPath(rec.areaSlug, rec.number),
    out,
  );
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
  home.slot(h.accreditationSlides);
  for (const [slot, who] of [
    [h.presidentMessage, "President's"],
    [h.deanMessage, "Dean's"],
    [h.programChairMessage, "Program Chair's"],
  ] as const) {
    home.slot(slot);
    // A published message without a real photo still needs one (dev/preview shows a stand-in meanwhile).
    if (slot.status === 'published' && !slot.value.photo) home.add(`${who} photograph (message is published)`);
  }

  const about = createCollector('About', '/about', out);
  const a = content.about;
  for (const s of [a.photo, a.intro, a.vision, a.mission, a.qualityPolicy, a.goals, a.objectives, a.programDescriptions, a.history, a.deans]) {
    about.slot(s);
  }

  createCollector('Faculty of Programs', '/about/faculty-of-programs', out).slot(content.facultyOfPrograms);
  const people = createCollector('People', '/about/people', out);
  for (const p of content.people) {
    if (isSample(p.id) || !isPending(p)) continue;
    people.add(`Person: ${p.name.trim() || p.id}`);
  }

  const faqs = createCollector('FAQs and location', '/about/faqs-and-location', out);
  for (const faq of content.faqs) {
    if (!isSample(faq.id) && isPending(faq)) faqs.add(`FAQ: ${faq.question}`);
  }

  const certificate = createCollector('Certificate of Authenticity', '/certificate-of-authenticity', out);
  certificate.resource(content.certificate.pdf);
  certificate.slot(content.certificate.image);

  createCollector('Compliance Report', COMPLIANCE_PATH, out).slot(content.compliance.overview);

  const realAreas = content.contentAreas.filter((area) => !isSample(area.narrativeReport.id));
  if (realAreas.length === 0)
    out.push({
      page: 'Accreditation Areas',
      path: AREAS_PATH,
      label: 'Area list not supplied',
    });
  realAreas.forEach((area) => collectArea(area, out));

  const realRecs = content.contentRecommendations.filter((rec) => !isSample(rec.document.id));
  if (realRecs.length === 0) {
    out.push({
      page: 'Compliance Report',
      path: COMPLIANCE_PATH,
      label: 'Recommendation list not supplied',
    });
  }
  realRecs.forEach((rec) => collectRecommendation(rec, content.contentAreas, out));

  return out;
}
