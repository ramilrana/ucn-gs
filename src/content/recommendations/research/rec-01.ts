import type { Recommendation, Resource } from '../../../types/content';

// Materials from UCN, updated 2026-11-24 (replacing the 2026-11-22 version): the recommendation link is now the
// Google Doc "1. Compliance Report -AREA I.docx" (it was row 2 of the compliance matrix sheet), and the documents are
// Google Drive files in Drive's preview frame instead of local copies: "Scanned copy of ICoP 2024 (1).pdf",
// "Completed Research.docx" (a Word file, labelled Doc) and "RESEARCH SERVICES MANUAL OF OPERATIONS.pdf". The local
// manual was used only here and was removed; the Research area page keeps its local ICoP and Completed Research PDFs.
// Titles are the supplied file names without the extension. Every link was opened and matches its name.

const driveFile = (id: string, title: string, fileId: string, format: Resource['format'] = 'pdf'): Resource => ({
  id,
  title,
  format,
  status: 'published',
  source: { kind: 'drive', fileId },
});

const folder = (id: string, title: string, folderId: string): Resource => ({
  id,
  title,
  format: 'folder',
  status: 'published',
  source: { kind: 'drive-folder', folderId },
});

// File name must match the number: this file is src/content/recommendations/research/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'research',
  number: 1,
  title: 'Recommendation 1',
  status: 'published',
  document: {
    id: 'rec-research-01-document',
    title: '1. Compliance Report -AREA I.docx',
    format: 'link',
    status: 'published',
    source: { kind: 'external', url: 'https://docs.google.com/document/d/1QZDqpWGE3KU0n6wF3F3sQ8ieACPgTJMH/edit' },
  },
  evidence: [
    {
      id: 'rec-research-01-published-research',
      title: 'Published Research of MPA Faculty',
      status: 'published',
      blocks: [
        {
          type: 'resources',
          items: [
            folder(
              'rec-research-01-published-research-folder',
              'Published research of MPA faculty',
              '1iNDuFTOAxvIeiIMOLbKAsN__9U_gGQtH',
            ),
          ],
        },
      ],
    },
    {
      id: 'rec-research-01-research-presentation',
      title: 'Research Presentation',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: driveFile(
            'rec-research-01-icop-2024',
            'Scanned copy of ICoP 2024 (1)',
            '161mOTsf5uqQEklPmz1WYkTBrHGBHZk5g',
          ),
        },
        {
          type: 'resources',
          items: [
            folder(
              'rec-research-01-research-presentation-folder',
              'View More: Research Presentation',
              '1ALh_dSXdn2OG5KbKuzGzIbhP9YK__Cbn',
            ),
          ],
        },
      ],
    },
    {
      id: 'rec-research-01-completed-research',
      title: 'Complete Research',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: driveFile(
            'rec-research-01-completed-research-doc',
            'Completed Research',
            '1bO24MsxlfTwkYOItdYFUAc7UqhuT5Zut',
            'doc',
          ),
        },
        {
          type: 'resources',
          items: [
            folder(
              'rec-research-01-completed-research-folder',
              'View More: Completed Research',
              '1Rgf07ZdVP5SdOU-fNDHv-rVIjkwccoiQ',
            ),
          ],
        },
      ],
    },
    {
      id: 'rec-research-01-manual',
      title: 'Research Services Manual of Operations',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: driveFile(
            'rec-research-01-manual-pdf',
            'RESEARCH SERVICES MANUAL OF OPERATIONS',
            '1aa63_IcDEnubsZqJISMl_3RF_U170E4H',
          ),
        },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
