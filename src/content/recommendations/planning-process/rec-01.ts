import type { EvidenceGroup, Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (the Google Doc "Compliance Report -AREA V Planning.docx")
// and four evidence items, each a Google Drive file in Drive's preview frame followed by a "View More" Drive folder
// (named "01" to "04"). Item 4 was listed as a PDF but is a Word file ("CNSC_Quality_Assurance_Plan_2025-2029.docx"),
// labelled Doc; Drive previews it like a PDF. Titles are the file names without the extension. Every link was opened
// and matches its name.

const evidence = (
  id: string,
  title: string,
  fileId: string,
  folderId: string,
  folderName: string,
  format: Resource['format'] = 'pdf',
): EvidenceGroup => ({
  id,
  title,
  status: 'published',
  blocks: [
    {
      type: 'document',
      embed: true,
      resource: { id: `${id}-file`, title, format, status: 'published', source: { kind: 'drive', fileId } },
    },
    {
      type: 'resources',
      items: [
        {
          id: `${id}-folder`,
          title: `View More: ${folderName}`,
          format: 'folder',
          status: 'published',
          source: { kind: 'drive-folder', folderId },
        },
      ],
    },
  ],
});

// File name must match the number: this file is src/content/recommendations/planning-process/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'planning-process',
  number: 1,
  title: 'Recommendation 1',
  status: 'published',
  document: {
    id: 'rec-planning-process-01-document',
    title: 'Compliance Report -AREA V Planning.docx',
    format: 'link',
    status: 'published',
    source: { kind: 'external', url: 'https://docs.google.com/document/d/1ddn1qPLECzPAqqQf5K1o30eJZH-EyBUu/edit' },
  },
  evidence: [
    evidence(
      'rec-planning-process-01-strategic-plan',
      'CNSC Excellence 2032 strategic plan version 2019',
      '1vtXzjyvDjZkUwyNl1TE6G5keXGgML4XE',
      '1pK0cciiJ88LpRByeSgPcpsSRJH2ZCu1r',
      '01',
    ),
    evidence(
      'rec-planning-process-01-plan-and-budget',
      'Graduate School Plan and Budget 2027',
      '1WmQ8makIejWf3x7kSd5XIHexIMWprfPz',
      '1jtJjpulEZTl8J8YSd5E5jak_O5tdxlD3',
      '02',
    ),
    evidence(
      'rec-planning-process-01-qcp',
      'Planning Process -QCP',
      '14YgU7VedDkrWfPBMpGkdtTHGxnk70IWW',
      '13ozoPEzbVxml0wU85bIE_hVsWCg1MvzK',
      '03',
    ),
    evidence(
      'rec-planning-process-01-quality-assurance-plan',
      'CNSC_Quality_Assurance_Plan_2025-2029',
      '1SPJJ9AMl_pVCqUsLX8vvzGHXYWTi1BGn',
      '1aLoNkvwNc4zIlGcr20p6Z8NcKX6umdPh',
      '04',
      'doc',
    ),
  ],
  additionalFiles: [],
};

export default recommendation;
