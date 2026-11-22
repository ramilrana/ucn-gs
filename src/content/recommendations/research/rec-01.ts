import type { Recommendation } from '../../../types/content';

// Materials from UCN (2026-11-22): the recommendation link (row 2 of the compliance matrix) and four evidence items.
// The ICoP 2024 and Completed Research PDFs are byte-identical to the Research area copies, so the same local files
// are reused; the manual is "RESEARCH SERVICES MANUAL OF OPERATIONS.pdf", renamed for the inline-path rule.
// Each local PDF was checked against its Drive link (same file name and page count).

// File name must match the number: this file is src/content/recommendations/research/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'research',
  number: 1,
  title: 'Recommendation 1',
  status: 'published',
  document: {
    id: 'rec-research-01-document',
    title: 'MPA LEVEL 4_COMPLIANCE MATRIX',
    format: 'link',
    status: 'published',
    source: {
      kind: 'external',
      url: 'https://docs.google.com/spreadsheets/d/14i-PZTubd1tzPo7uT98wAjn9Jv4lujk2xkL8aMu9h2o/edit?gid=0#gid=0&range=2:2',
    },
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
            {
              id: 'rec-research-01-published-research-folder',
              title: 'Published research of MPA faculty',
              format: 'folder',
              status: 'published',
              source: { kind: 'drive-folder', folderId: '1iNDuFTOAxvIeiIMOLbKAsN__9U_gGQtH' },
            },
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
          resource: {
            id: 'rec-research-01-icop-2024',
            title: 'ICoP 2024 (scanned copy)',
            format: 'pdf',
            status: 'published',
            inline: true,
            source: { kind: 'local', path: '/files/research/icop-2024.pdf' },
          },
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-research-01-research-presentation-folder',
              title: 'View More: Research Presentation',
              format: 'folder',
              status: 'published',
              source: { kind: 'drive-folder', folderId: '1ALh_dSXdn2OG5KbKuzGzIbhP9YK__Cbn' },
            },
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
          resource: {
            id: 'rec-research-01-completed-research-pdf',
            title: 'Completed Research (AACCUP)',
            format: 'pdf',
            status: 'published',
            inline: true,
            source: { kind: 'local', path: '/files/research/completed-research.pdf' },
          },
        },
        {
          type: 'resources',
          items: [
            {
              id: 'rec-research-01-completed-research-folder',
              title: 'View More: Completed Research',
              format: 'folder',
              status: 'published',
              source: { kind: 'drive-folder', folderId: '1Rgf07ZdVP5SdOU-fNDHv-rVIjkwccoiQ' },
            },
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
          resource: {
            id: 'rec-research-01-manual-pdf',
            title: 'Research Services Manual of Operations',
            format: 'pdf',
            status: 'published',
            inline: true,
            source: { kind: 'local', path: '/files/research/research-services-manual.pdf' },
          },
        },
      ],
    },
  ],
  additionalFiles: [],
};

export default recommendation;
