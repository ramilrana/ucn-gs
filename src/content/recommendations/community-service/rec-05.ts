import type { Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-23): the recommendation link (a bookmark in "Compliance Report _Area 3.docx") and three
// PDFs on Google Drive, shown in Drive's preview frame; only the first is followed by the "Recommendation 5" folder
// (the other two are "PDF Only"). Document titles are the file names without ".pdf"; evidence titles drop the number
// prefixes. Every link was opened and matches its name.

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

// File name must match the number: this file is src/content/recommendations/community-service/rec-05.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 5,
  title: 'Recommendation 5',
  status: 'published',
  document: {
    id: 'rec-community-service-05-document',
    title: 'Compliance Report _Area 3.docx',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/document/d/1josykUPsE2tSzn-hndhVRH8Fiu_COlq-/edit#bookmark=id.22xan96l0ggw',
    },
  },
  evidence: [
    {
      id: 'rec-community-service-05-gs-ppas',
      title: 'GS PPAs 2026',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf('rec-community-service-05-gs-ppas-pdf', '01. GS PPAs 2026', '1CukM6bj-r5gq0q5a1ePpZK5IHegImsqg'),
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-community-service-05-gs-ppas-folder',
              title: 'View More: Recommendation 5',
              format: 'folder',
              status: 'published',
              source: { kind: 'drive-folder', folderId: '1KfFyXY2jvlc7DKijOyydyFRi2J_5mpED' },
            },
          ],
        },
      ],
    },
    {
      id: 'rec-community-service-05-gs-ppmp',
      title: 'GS-PPMP-2026-',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf('rec-community-service-05-gs-ppmp-pdf', '05. GS-PPMP-2026-', '1X6pjXn_JXkRpT9hkAC6RKjmqGhIDHeON'),
        },
      ],
    },
    {
      id: 'rec-community-service-05-bur',
      title: 'BUR-month.-Sep.-2026',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf('rec-community-service-05-bur-pdf', '06. BUR-month.-Sep.-2026', '1cbSOuhta07pyj3UUAI94Fi3GI1xXG9z9'),
        },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
