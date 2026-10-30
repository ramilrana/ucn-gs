// Dev-only sample content ("Sample area", "Sample 1/2/3") for checking the page templates in a
// browser before UCN supplies materials. src/content/index.ts includes it only in dev and preview
// builds; `npm run check:dist` fails if any DEV-SAMPLE id reaches a production build.
//
// Keep this module free of side effects so Rollup can drop it: only declarations at the top level,
// and every top-level call carries a PURE annotation.
import type { Area, EvidenceGroup, ImageAsset, Recommendation, Resource, ResourceFormat, ResourceSource } from '../types/content';
// `no-inline` keeps the 600-byte PDF out of Vite's 4 kB data-URI inlining, which would break devLocalSource.
import samplePdf from './sample.pdf?url&no-inline';
import { svgPlaceholder } from './svgPlaceholder';

/**
 * Wraps the bundler URL of the sample PDF as a local source: strips the site base path from the
 * start (localFileUrl adds it back) and casts the rest to the `/files/` template type.
 * The cast is dev-only: the sample PDF lives in src/dev/, not in public/files/.
 */
export function devLocalSource(url: string): ResourceSource {
  const base = import.meta.env.BASE_URL;
  const rest = url.startsWith(base) ? url.slice(base.length) : url.replace(/^\/+/, '');
  return { kind: 'local', path: `/${rest}` as `/files/${string}` };
}

function sampleImage(n: number): ImageAsset {
  return { src: svgPlaceholder(`Sample image ${n}`, 800, 600), width: 800, height: 600, alt: `Sample image ${n}` };
}

function pendingResource(id: string, title: string, format: ResourceFormat): Resource {
  return { id: `DEV-SAMPLE-${id}`, title, format, status: 'pending' };
}

function samplePdfResource(id: string, title: string): Resource {
  return { id: `DEV-SAMPLE-${id}`, title, format: 'pdf', status: 'published', source: devLocalSource(samplePdf), downloadable: true };
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
      blocks: [{ type: 'document', resource: samplePdfResource(`${prefix}-doc`, 'Sample document'), embed: true }],
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
    number: 99,
    title: 'Sample recommendation',
    status: 'pending',
    statement: /* @__PURE__ */ sampleText(),
    document: /* @__PURE__ */ samplePdfResource('rec-document', 'Sample recommendation document'),
    evidence: /* @__PURE__ */ sampleGroups('rec'),
    additionalFiles: [/* @__PURE__ */ pendingResource('rec-extra', 'Sample additional file', 'doc')],
  },
];
