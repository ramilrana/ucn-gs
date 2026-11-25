import type { Recommendation, Resource } from '../../../types/content';

// Materials from UCN (2026-11-23): the recommendation link (a bookmark in "Compliance Report _Area 3.docx") and five
// PDFs on Google Drive, shown in Drive's preview frame. Document titles are the supplied file names without ".pdf";
// the 4th file is "5.1 Barangay Public Financial Management & Procurement.pdf" on Drive, titled without "5.1" as the
// user typed it. Evidence titles drop the file-number prefixes. Every link was opened and matches its name.

const VIEW_MORE_FOLDER = '1N4TZi9Pf0HpaGammODkXTVArb61fS_6w';

const drivePdf = (id: string, title: string, fileId: string): Resource => ({
  id,
  title,
  format: 'pdf',
  status: 'published',
  source: { kind: 'drive', fileId },
});

const viewMore = (id: string): Resource => ({
  id,
  title: 'View More: Recommendation 1',
  format: 'folder',
  status: 'published',
  source: { kind: 'drive-folder', folderId: VIEW_MORE_FOLDER },
});

// Recommendation Link updated 2026-11-25 (user's request): the Google Doc "1. Compliance Report _Area 3.docx", no bookmark.
// File name must match the number: this file is src/content/recommendations/community-service/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 1,
  title: 'Recommendation 1',
  status: 'published',
  document: {
    id: 'rec-community-service-01-document',
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
      id: 'rec-community-service-01-project-thrive',
      title: 'PROJECT THRIVE',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf('rec-community-service-01-project-thrive-pdf', '1.1 PROJECT THRIVE', '1Lwonbk8fBU-HKroNZgXQJri-7nA6BcKb'),
        },
        { type: 'resources', items: [viewMore('rec-community-service-01-project-thrive-folder')] },
      ],
    },
    {
      id: 'rec-community-service-01-project-thrive-pra',
      title: 'PROJECT THRIVE_PRA',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf('rec-community-service-01-project-thrive-pra-pdf', '2. PROJECT THRIVE_PRA', '1vTiIJTQMkTzYggT8ncKCGyAxV7p1v1oI'),
        },
      ],
    },
    {
      id: 'rec-community-service-01-extension-agenda',
      title: 'Institutional Extension Agenda',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-community-service-01-extension-agenda-pdf',
            '3. Institutional Extension Agenda',
            '1ekYMmco4jhkjAs58bWM2kxM3OaxsdiH9',
          ),
        },
      ],
    },
    {
      id: 'rec-community-service-01-barangay-pfm',
      title: 'Barangay Public Financial Management & Procurement',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-community-service-01-barangay-pfm-pdf',
            'Barangay Public Financial Management & Procurement',
            '1VsVyABRvaqfFZtbLTav0DfeaNdMthRw-',
          ),
        },
        { type: 'resources', items: [viewMore('rec-community-service-01-barangay-pfm-folder')] },
      ],
    },
    {
      id: 'rec-community-service-01-ethical-leadership',
      title: 'Ethical Leadership and Public Trust_May 24, 2025',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: drivePdf(
            'rec-community-service-01-ethical-leadership-pdf',
            '6. Ethical Leadership and Public Trust_May 24, 2025',
            '1L85ueeLQkvUe9alTj0uP_eDuO-kn6GUz',
          ),
        },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
