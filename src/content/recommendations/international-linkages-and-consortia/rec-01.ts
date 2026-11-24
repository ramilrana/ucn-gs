import type { Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (a bookmark in "Compliance Report - International Linkages -
// MPA - Level 4.docx") and two evidence items, Google Drive PDFs in Drive's preview frame ("PDF only"); the second is
// followed by a link to row 2 of the "MPA LEVEL 4_COMPLIANCE MATRIX.xlsx" Google Sheet (Sheets cannot be framed under
// the CSP). Titles are the supplied file names without ".pdf". Every link was opened and matches its name.

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

// File name must match the number: this file is src/content/recommendations/international-linkages-and-consortia/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'international-linkages-and-consortia',
  number: 1,
  title: 'Recommendation 1',
  status: 'published',
  document: {
    id: 'rec-international-linkages-and-consortia-01-document',
    title: 'Compliance Report - International Linkages - MPA - Level 4.docx',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/document/d/1rn9LTRLDdI3_5ODDaWS772YvcSb0t3DV/edit#bookmark=id.9pk3qfwam4te',
    },
  },
  evidence: [
    {
      id: 'rec-international-linkages-and-consortia-01-alignment-matrix',
      title: 'Alignment Matrix Mapping MOU objectives and MPA Objectives',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-international-linkages-and-consortia-01-alignment-matrix-pdf',
            'Alignment Matrix Mapping MOU objectives and MPA Objectives',
            '1GvxRtSH2Kc8nbBL2GbypBPlcPZeLcBzq',
          ),
        },
      ],
    },
    {
      id: 'rec-international-linkages-and-consortia-01-mou-provisions',
      title: 'MOU Provisions',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-international-linkages-and-consortia-01-mou-provisions-pdf',
            'MOU Provisions',
            '1eejJ7wKeCMJ5enzKfMW9F6rvvCWIpVE8',
          ),
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-international-linkages-and-consortia-01-compliance-matrix',
              title: 'MPA LEVEL 4_COMPLIANCE MATRIX.xlsx',
              format: 'link',
              status: 'published',
              source: {
                kind: 'external',
                url: 'https://docs.google.com/spreadsheets/d/1bhlMaZrg1vl0-cDEmPRnfBbVzC2XrG5V/edit?gid=765686400#gid=765686400&range=2:2',
              },
            },
          ],
        },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
