import type { Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (a bookmark in "Compliance Report - International Linkages -
// MPA - Level 4.docx") and two evidence items, each a Google Drive PDF in Drive's preview frame followed by a link
// (the user's "a" sub-items): the Drive folder "02" (titled "View More: 02") and row 3 of the "MPA LEVEL 4_COMPLIANCE
// MATRIX.xlsx" Google Sheet. The ICOP report is the same Drive file as on the area page. Titles are the supplied file
// names without ".pdf". Every link was opened and matches its name.

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

// File name must match the number: this file is src/content/recommendations/international-linkages-and-consortia/rec-02.ts
const recommendation: Recommendation = {
  areaSlug: 'international-linkages-and-consortia',
  number: 2,
  title: 'Recommendation 2',
  status: 'published',
  document: {
    id: 'rec-international-linkages-and-consortia-02-document',
    title: 'Compliance Report - International Linkages - MPA - Level 4.docx',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/document/d/1rn9LTRLDdI3_5ODDaWS772YvcSb0t3DV/edit#bookmark=id.tmznrhwdq0ik',
    },
  },
  evidence: [
    {
      id: 'rec-international-linkages-and-consortia-02-program-linkages',
      title: 'TABLE OF PROGRAM LINKAGES',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-international-linkages-and-consortia-02-program-linkages-pdf',
            'TABLE OF PROGRAM LINKAGES',
            '1_dMgCwOSc3fcYB7fApygo-uhEcdY9Tbi',
          ),
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-international-linkages-and-consortia-02-program-linkages-folder',
              title: 'View More: 02',
              format: 'folder',
              status: 'published',
              source: { kind: 'drive-folder', folderId: '1TwU-D9NtqreWRDPdG1rxY37fNRRfiAdF' },
            },
          ],
        },
      ],
    },
    {
      id: 'rec-international-linkages-and-consortia-02-icop',
      title: 'ACCOMPLISHMENT REPORT - ICOP',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-international-linkages-and-consortia-02-icop-pdf',
            'ACCOMPLISHMENT REPORT - ICOP',
            '1RSJV49Gqca9Dk-3kgs63408yU_RQFxqs',
          ),
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-international-linkages-and-consortia-02-compliance-matrix',
              title: 'MPA LEVEL 4_COMPLIANCE MATRIX.xlsx',
              format: 'link',
              status: 'published',
              source: {
                kind: 'external',
                url: 'https://docs.google.com/spreadsheets/d/1bhlMaZrg1vl0-cDEmPRnfBbVzC2XrG5V/edit?gid=765686400#gid=765686400&range=3:3',
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
