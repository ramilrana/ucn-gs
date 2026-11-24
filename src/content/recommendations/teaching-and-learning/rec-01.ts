import type { EvidenceGroup, Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (the Google Doc "Compliance Report - AREA II - MPA Level
// 4.docx") and five evidence items. PDFs are Google Drive files in Drive's preview frame ("PDF only"); the graduates
// table (a Google Doc) and the awards folder are links only. Document titles are the supplied file names without
// ".pdf". The user's list had a stray item 2 (the alumni tracer study again, without a heading): dropped, and the two
// headings' "Tracker" spelled "Tracer" like the files (user's choices, 2026-11-24). Every link was opened and matches
// its name.

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

const pdfOnly = (id: string, title: string, pdfTitle: string, fileId: string): EvidenceGroup => ({
  id,
  title,
  status: 'published',
  blocks: [{ type: 'document', embed: true, resource: drivePdf(`${id}-pdf`, pdfTitle, fileId) }],
});

const linkOnly = (id: string, title: string, resource: Resource): EvidenceGroup => ({
  id,
  title,
  status: 'published',
  blocks: [{ type: 'resources', items: [resource] }],
});

// File name must match the number: this file is src/content/recommendations/teaching-and-learning/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'teaching-and-learning',
  number: 1,
  title: 'Recommendation 1',
  status: 'published',
  document: {
    id: 'rec-teaching-and-learning-01-document',
    title: 'Compliance Report - AREA II - MPA Level 4.docx',
    format: 'link',
    status: 'published',
    source: { kind: 'external', url: 'https://docs.google.com/document/d/1uppr9GBya33aIr0EG-DE00E8hKLKwEIV/edit' },
  },
  evidence: [
    pdfOnly(
      'rec-teaching-and-learning-01-tracer-2021-2026',
      'MPA Tracer Study (2021-2026)',
      'MPA Tracer Study 2021-2026',
      '1CVNdUdSe8gtrDKAVzCL_9CzTdIbpaTm7',
    ),
    pdfOnly(
      'rec-teaching-and-learning-01-tracer-2000-2024',
      'MPA Tracer Study (2000-2024)',
      'Tracer Study of MPA Alumni',
      '1h2g2Fpvxhq-hIx8lBlYnJr4on_qcaRv-',
    ),
    linkOnly('rec-teaching-and-learning-01-graduates-table', 'MPA Graduates Table', {
      id: 'rec-teaching-and-learning-01-graduates-table-doc',
      title: 'Percentage of MPA Graduates Promoted to Higher Positions.docx',
      format: 'doc',
      status: 'published',
      source: { kind: 'external', url: 'https://docs.google.com/document/d/1h0jAS_UVIrlOmQ81Ic0luw9t--PVEaDF/edit' },
    }),
    pdfOnly(
      'rec-teaching-and-learning-01-employer-satisfaction',
      'MPA Employer Satisfaction',
      'MPA_Employer_Satisfaction',
      '1WqHdZEufAXT-KKgKoKc72FdK5UYUH-Of',
    ),
    linkOnly('rec-teaching-and-learning-01-awards', 'Awards/Nomination', {
      id: 'rec-teaching-and-learning-01-awards-folder',
      title: 'Awards/Recognition/Commendation',
      format: 'folder',
      status: 'published',
      source: { kind: 'drive-folder', folderId: '18-fHJC2xILDAevBYdi2R7ttmREAtz6h3' },
    }),
  ],
  additionalFiles: [],
};

export default recommendation;
