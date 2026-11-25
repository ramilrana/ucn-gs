import type { Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-23): the recommendation link (a bookmark in "Compliance Report _Area 3.docx") and three
// PDFs on Google Drive, shown in Drive's preview frame, each followed by the "Recommendation 3" folder (labelled
// "View More" on all three for consistency; the user's list labels only the first). Document titles are the file
// names without ".pdf"; evidence titles drop the number prefixes. Every link was opened and matches its name.

const VIEW_MORE_FOLDER = '1hQW-esBtknnw6JyVKtBdolO2BfgKKEHn';

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

const viewMore = (id: string): Resource => ({
  id,
  title: 'View More: Recommendation 3',
  format: 'folder',
  status: 'published',
  source: { kind: 'drive-folder', folderId: VIEW_MORE_FOLDER },
});

// Recommendation Link updated 2026-11-25 (user's request): the Google Doc "1. Compliance Report _Area 3.docx", no bookmark.
// File name must match the number: this file is src/content/recommendations/community-service/rec-03.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 3,
  title: 'Recommendation 3',
  status: 'published',
  document: {
    id: 'rec-community-service-03-document',
    title: '1. Compliance Report _Area 3.docx',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/document/d/1ZlHAm3IkciBLH9Apb0yc7vKbW4HV4OrQ/edit',
    },
  },
  evidence: [
    {
      id: 'rec-community-service-03-proof-of-engagement',
      title: 'May 30, 2026 Proof of Engagement',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-community-service-03-proof-of-engagement-pdf',
            '02. May 30, 2026 Proof of Engagement',
            '1rTjQyBEdMv0ad78iy8ZqwqjNAnG__S7j',
          ),
        },
        { type: 'resources', items: [viewMore('rec-community-service-03-proof-of-engagement-folder')] },
      ],
    },
    {
      id: 'rec-community-service-03-narrative-report',
      title: 'Narrative report_May 30, 2026',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-community-service-03-narrative-report-pdf',
            '04. Narrative report_May 30, 2026',
            '1DZ6iaPS7lvoJ-xUxABKq_eat8dty7vtn',
          ),
        },
        { type: 'resources', items: [viewMore('rec-community-service-03-narrative-report-folder')] },
      ],
    },
    {
      id: 'rec-community-service-03-first-activity',
      title: '1st Activity May 24, 2025',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-community-service-03-first-activity-pdf',
            '09. 1st Activity May 24, 2025',
            '12NRcrR-P5HgMAlnACjwFwdJpRD2rkFuA',
          ),
        },
        { type: 'resources', items: [viewMore('rec-community-service-03-first-activity-folder')] },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
