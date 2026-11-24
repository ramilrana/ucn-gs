import type { Recommendation } from '../../../types/content';

// Materials from UCN (2026-11-24): the recommendation link (the Google Doc "1. Compliance Report -AREA I.docx") and
// one evidence item: "IPR Policy BOT-Approved.pdf" on Google Drive, shown in Drive's preview frame, followed by the
// "Copyrighted Output" Drive folder. Titles are the supplied file and folder names (".pdf" dropped). Every link was
// opened and matches its name.

// File name must match the number: this file is src/content/recommendations/research/rec-02.ts
const recommendation: Recommendation = {
  areaSlug: 'research',
  number: 2,
  title: 'Recommendation 2',
  status: 'published',
  document: {
    id: 'rec-research-02-document',
    title: '1. Compliance Report -AREA I.docx',
    format: 'link',
    status: 'published',
    source: { kind: 'external', url: 'https://docs.google.com/document/d/1QZDqpWGE3KU0n6wF3F3sQ8ieACPgTJMH/edit' },
  },
  evidence: [
    {
      id: 'rec-research-02-ipr-policy',
      title: 'IPR Policy BOT-Approved',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: {
            id: 'rec-research-02-ipr-policy-pdf',
            title: 'IPR Policy BOT-Approved',
            format: 'pdf',
            status: 'published',
            source: { kind: 'drive', fileId: '1XM2mSXWWYEp7CuWcWmGETA4R2UOLHE1x' },
          },
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-research-02-copyrighted-output-folder',
              title: 'Copyrighted Output',
              format: 'folder',
              status: 'published',
              source: { kind: 'drive-folder', folderId: '1MEGIYm1crSYooai6wlh0_9ZH8UFRVU9e' },
            },
          ],
        },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
