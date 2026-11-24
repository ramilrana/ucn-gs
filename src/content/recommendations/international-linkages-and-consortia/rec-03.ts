import type { Recommendation } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (a bookmark in "Compliance Report - International Linkages -
// MPA - Level 4.docx") and one evidence item: "Accomplishment Report - ICBEST Mam EMS.pdf" (the same Drive file as on
// the area page) in Drive's preview frame, followed by row 4 of the "MPA LEVEL 4_COMPLIANCE MATRIX.xlsx" Google Sheet
// (listed as "View More"; titled with the sheet's name like Recommendations 1 and 2). Every link was opened and
// matches its name.

// File name must match the number: this file is src/content/recommendations/international-linkages-and-consortia/rec-03.ts
const recommendation: Recommendation = {
  areaSlug: 'international-linkages-and-consortia',
  number: 3,
  title: 'Recommendation 3',
  status: 'published',
  document: {
    id: 'rec-international-linkages-and-consortia-03-document',
    title: 'Compliance Report - International Linkages - MPA - Level 4.docx',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/document/d/1rn9LTRLDdI3_5ODDaWS772YvcSb0t3DV/edit#bookmark=id.elq78h5w86qg',
    },
  },
  evidence: [
    {
      id: 'rec-international-linkages-and-consortia-03-icbest',
      title: 'Accomplishment Report - ICBEST Mam EMS',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: {
            id: 'rec-international-linkages-and-consortia-03-icbest-pdf',
            title: 'Accomplishment Report - ICBEST Mam EMS',
            format: 'pdf',
            status: 'published',
            source: { kind: 'drive', fileId: '1hXitjD9qCYHkVhTEsD2HfK9va3VTJNS0' },
          },
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-international-linkages-and-consortia-03-compliance-matrix',
              title: 'MPA LEVEL 4_COMPLIANCE MATRIX.xlsx',
              format: 'link',
              status: 'published',
              source: {
                kind: 'external',
                url: 'https://docs.google.com/spreadsheets/d/1bhlMaZrg1vl0-cDEmPRnfBbVzC2XrG5V/edit?gid=765686400#gid=765686400&range=4:4',
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
