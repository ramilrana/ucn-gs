import type { EvidenceGroup, Recommendation } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (a bookmark in "Compliance Report - International Linkages -
// MPA - Level 4.docx") and two evidence items, Google Drive PDFs in Drive's preview frame ("PDF only"). Titles are the
// supplied file names without ".pdf", kept as supplied ("Minutes of Meeting. - ICoP" includes its full stop). Every
// link was opened and matches its name.

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

// File name must match the number: this file is src/content/recommendations/international-linkages-and-consortia/rec-04.ts
const recommendation: Recommendation = {
  areaSlug: 'international-linkages-and-consortia',
  number: 4,
  title: 'Recommendation 4',
  status: 'published',
  document: {
    id: 'rec-international-linkages-and-consortia-04-document',
    title: 'Compliance Report - International Linkages - MPA - Level 4.docx',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/document/d/1rn9LTRLDdI3_5ODDaWS772YvcSb0t3DV/edit#bookmark=id.rdei9yxdwgcr',
    },
  },
  evidence: [
    pdfOnly(
      'rec-international-linkages-and-consortia-04-minutes',
      'Minutes of Meeting. - ICoP',
      '1Niflf3P9zsN_FPn9sH7D8ERtavOdxEoe',
    ),
    pdfOnly(
      'rec-international-linkages-and-consortia-04-post-engagement',
      'Post Engagement Assessment Report - ICoP',
      '1-60Yd77AN7i4lngpWYlGu2lE5evqcofT',
    ),
  ],
  additionalFiles: [],
};

export default recommendation;
