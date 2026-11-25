import type { Recommendation } from '../../../types/content';

// Materials from UCN (2026-11-23): the recommendation link (a bookmark in "Compliance Report _Area 3.docx") and one PDF
// on Google Drive, shown in Drive's preview frame, followed by the "Recommendation 4" folder. Title is the supplied
// file name without ".pdf". Every link was opened and matches its name.

// Recommendation Link updated 2026-11-25 (user's request): the Google Doc "1. Compliance Report _Area 3.docx", no bookmark.
// File name must match the number: this file is src/content/recommendations/community-service/rec-04.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 4,
  title: 'Recommendation 4',
  status: 'published',
  document: {
    id: 'rec-community-service-04-document',
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
      id: 'rec-community-service-04-pra-brgy-gubat',
      title: 'PRA-Brgy-Gubat_May 13, 2024',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: {
            id: 'rec-community-service-04-pra-brgy-gubat-pdf',
            title: 'PRA-Brgy-Gubat_May 13, 2024',
            format: 'pdf',
            status: 'published',
            source: { kind: 'drive', fileId: '1-lhvXYtozo3kKvp6oH8FNm28u35sJqn3' },
          },
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-community-service-04-pra-brgy-gubat-folder',
              title: 'View More: Recommendation 4',
              format: 'folder',
              status: 'published',
              source: { kind: 'drive-folder', folderId: '1FOil2RT9Fsnb4E5-TJTiWWxI4fdt9BpZ' },
            },
          ],
        },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
