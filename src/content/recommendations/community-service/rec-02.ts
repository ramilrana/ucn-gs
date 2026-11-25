import type { Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-23): the recommendation link (a bookmark in "Compliance Report _Area 3.docx") and two
// PDFs on Google Drive, shown in Drive's preview frame, each followed by the "Recommendation 2" folder. Titles are the
// supplied file names without ".pdf". Every link was opened and matches its name.

const VIEW_MORE_FOLDER = '1Qu5uqyN_O5qzhqfLLRjEIawSd2AmET7l';

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

const viewMore = (id: string): Resource => ({
  id,
  title: 'View More: Recommendation 2',
  format: 'folder',
  status: 'published',
  source: { kind: 'drive-folder', folderId: VIEW_MORE_FOLDER },
});

// Recommendation Link updated 2026-11-25 (user's request): the Google Doc "1. Compliance Report _Area 3.docx", no bookmark.
// File name must match the number: this file is src/content/recommendations/community-service/rec-02.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 2,
  title: 'Recommendation 2',
  status: 'published',
  document: {
    id: 'rec-community-service-02-document',
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
      id: 'rec-community-service-02-research-letter',
      title: 'Letter_for the research undertaking',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-community-service-02-research-letter-pdf',
            'Letter_for the research undertaking',
            '14Q4x1TvDVrFVznp-5pGxFm5odlBu-4nS',
          ),
        },
        { type: 'resources', items: [viewMore('rec-community-service-02-research-letter-folder')] },
      ],
    },
    {
      id: 'rec-community-service-02-project-thrive',
      title: 'PROJECT THRIVE',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf('rec-community-service-02-project-thrive-pdf', 'PROJECT THRIVE', '14ta_oV1LysLnMcgrEKZqGw5YMr-URe8F'),
        },
        { type: 'resources', items: [viewMore('rec-community-service-02-project-thrive-folder')] },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
