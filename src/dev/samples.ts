// Dev-only sample content ("Sample area", "Sample 1/2/3") for checking the page templates in a
// browser before UCN supplies materials. src/content/index.ts includes it only in dev and preview
// builds; `npm run check:dist` fails if any DEV-SAMPLE id reaches a production build.
//
// Keep this module free of side effects so Rollup can drop it: only declarations at the top level,
// and every top-level call carries a PURE annotation.
import type { Area, EvidenceGroup, ImageAsset, Recommendation, Resource, ResourceFormat } from '../types/content';
import { svgPlaceholder } from './svgPlaceholder';

/**
 * The sample PDF is served at this real /files/ URL by the devSamplePdf plugin in vite.config.ts: by the dev
 * server, and copied into preview-content builds. It never reaches a production build (check:dist fails if it does).
 */
const SAMPLE_PDF_PATH = '/files/dev-sample.pdf' as const;

function sampleImage(n: number): ImageAsset {
  return { src: svgPlaceholder(`Sample image ${n}`, 800, 600), width: 800, height: 600, alt: `Sample image ${n}` };
}

function pendingResource(id: string, title: string, format: ResourceFormat): Resource {
  return { id: `DEV-SAMPLE-${id}`, title, format, status: 'pending' };
}

function samplePdfResource(id: string, title: string): Resource {
  return { id: `DEV-SAMPLE-${id}`, title, format: 'pdf', status: 'published', source: { kind: 'local', path: SAMPLE_PDF_PATH }, downloadable: true, inline: true };
}

// Obviously fake but valid-format Drive id (20+ of [A-Za-z0-9_-]); it points at no real file, so the
// Drive frame shows an error page. It exists so the on-demand Preview button can be pressed in a browser.
const DEV_DRIVE_ID = 'DEVSAMPLEdriveFileId000000';

function sampleDriveResource(id: string, title: string): Resource {
  return { id: `DEV-SAMPLE-${id}`, title, format: 'pdf', status: 'published', source: { kind: 'drive', fileId: DEV_DRIVE_ID } };
}

function sampleText(): string[] {
  return ['Sample text for checking the page layout. It is not accreditation evidence.'];
}

function sampleGroups(prefix: string): EvidenceGroup[] {
  return [
    {
      id: `DEV-SAMPLE-${prefix}-group-1`,
      title: 'Sample 1',
      status: 'published',
      blocks: [
        // The sample local PDF opts in to inline display, so this embed:true block shows the inline frame.
        { type: 'document', resource: samplePdfResource(`${prefix}-doc`, 'Sample document'), embed: true },
        // A Drive-hosted document in on-demand mode: the only sample with a Preview button.
        { type: 'document', resource: sampleDriveResource(`${prefix}-drive-doc`, 'Sample Drive document'), embed: false },
      ],
    },
    {
      id: `DEV-SAMPLE-${prefix}-group-2`,
      title: 'Sample 2',
      status: 'published',
      blocks: [
        { type: 'gallery', images: [sampleImage(1), sampleImage(2), sampleImage(3)] },
        { type: 'text', paragraphs: sampleText() },
      ],
    },
    {
      id: `DEV-SAMPLE-${prefix}-group-3`,
      title: 'Sample 3',
      status: 'published',
      blocks: [
        {
          type: 'resources',
          items: [
            samplePdfResource(`${prefix}-file`, 'Sample file'),
            pendingResource(`${prefix}-pending-doc`, 'Sample pending document', 'doc'),
          ],
        },
        // A video whose source is still pending, so the pending state of a video block can be checked.
        { type: 'video', resource: pendingResource(`${prefix}-video`, 'Sample video', 'video') },
      ],
    },
  ];
}

export const sampleAreas: Area[] = [
  {
    slug: 'sample-area',
    order: 999,
    title: 'Sample area',
    status: 'pending',
    summary: /* @__PURE__ */ sampleText(),
    gallery: {
      label: 'Sample area gallery',
      status: 'published',
      value: [/* @__PURE__ */ sampleImage(1), /* @__PURE__ */ sampleImage(2), /* @__PURE__ */ sampleImage(3)],
    },
    narrativeReport: /* @__PURE__ */ samplePdfResource('area-narrative', 'Sample narrative report'),
    groups: /* @__PURE__ */ sampleGroups('area'),
    additionalFiles: [/* @__PURE__ */ pendingResource('area-extra', 'Sample additional file', 'doc')],
    avp: { .../* @__PURE__ */ pendingResource('area-avp', 'Sample AVP', 'video'), avpTitle: 'Sample AVP' },
  },
];

export const sampleRecommendations: Recommendation[] = [
  {
    areaSlug: 'sample-area',
    number: 1,
    title: 'Sample recommendation',
    status: 'pending',
    statement: /* @__PURE__ */ sampleText(),
    document: /* @__PURE__ */ samplePdfResource('rec-document', 'Sample recommendation document'),
    evidence: /* @__PURE__ */ sampleGroups('rec'),
    additionalFiles: [/* @__PURE__ */ pendingResource('rec-extra', 'Sample additional file', 'doc')],
  },
];
