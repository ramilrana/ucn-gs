import type { EvidenceGroup, Recommendation } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (a bookmark in "Compliance Report - International Linkages -
// MPA - Level 4.docx") and two evidence items, Google Drive PDFs in Drive's preview frame ("PDF only"). Titles are the
// supplied file names without ".pdf". Every link was opened and matches its name.

const pdfOnly = (id: string, title: string, fileId: string): EvidenceGroup => ({
  id,
  title,
  status: 'published',
  blocks: [
    {
      type: 'document',
      embed: true,
      resource: { id: `${id}-pdf`, title, format: 'pdf', status: 'published', source: { kind: 'drive', fileId } },
    },
  ],
});

// File name must match the number: this file is src/content/recommendations/international-linkages-and-consortia/rec-05.ts
const recommendation: Recommendation = {
  areaSlug: 'international-linkages-and-consortia',
  number: 5,
  title: 'Recommendation 5',
  status: 'published',
  document: {
    id: 'rec-international-linkages-and-consortia-05-document',
    title: 'Compliance Report - International Linkages - MPA - Level 4.docx',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/document/d/1rn9LTRLDdI3_5ODDaWS772YvcSb0t3DV/edit#bookmark=id.rcqvk6xpvaxg',
    },
  },
  evidence: [
    pdfOnly(
      'rec-international-linkages-and-consortia-05-budget',
      'Budget for Internationalization (FOREIGN TRAVEL)',
      '1K045YsMU-nJkECrcZGBcnwmkO5yD1ncb',
    ),
    pdfOnly(
      'rec-international-linkages-and-consortia-05-funds-certification',
      'Certification of Funds Availability-ICoP',
      '1ossxS0lZThPgP_fd6XNwCRFqiWigZCcC',
    ),
  ],
  additionalFiles: [],
};

export default recommendation;
