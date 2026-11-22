import p1 from '../../assets/areas/research/photo-01.jpg?w=640;975&format=webp&as=picture';
import p2 from '../../assets/areas/research/photo-02.jpg?w=640;975&format=webp&as=picture';
import p3 from '../../assets/areas/research/photo-03.jpg?w=640;975&format=webp&as=picture';
import p4 from '../../assets/areas/research/photo-04.jpg?w=640;975&format=webp&as=picture';
import p5 from '../../assets/areas/research/photo-05.jpg?w=640;975&format=webp&as=picture';
import p6 from '../../assets/areas/research/photo-06.jpg?w=640;975&format=webp&as=picture';
import { toImageAsset } from '../../lib/images';
import type { Area } from '../../types/content';

// Materials from UCN (2026-11-22): the narrative profile ("Area I Narrative Profile 3.pdf"), 6 photos (Drive zip,
// files 11–16 in order) and three documents, all shown inline. PDFs renamed for safe inline paths; titles follow
// the supplied file names. Alt text worded by us, repeating printed captions.

// File name must be the slug: this file is src/content/areas/research.ts
const area: Area = {
  slug: 'research',
  order: 1,
  title: 'Research',
  status: 'published',
  gallery: {
    status: 'published',
    label: 'Research photo gallery',
    value: [
      toImageAsset(
        p1,
        'Group photo of delegates at the 2nd International Congress on Pineapple 2026, September 08, 2026, Daet, Camarines Norte',
      ),
      toImageAsset(
        p2,
        'Seated and standing group photo at the 2nd International Congress on Pineapple 2026, September 08, 2026, Daet, Camarines Norte',
      ),
      toImageAsset(
        p3,
        'Large group photo at the International Conference on Business, Education, Science and Technology (ICBEST) 2026, October 22–24, 2026',
      ),
      toImageAsset(
        p4,
        'Open forum with three speakers seated on a stage at the 2nd International Congress on Pineapple 2026, September 08, 2026, Daet, Camarines Norte',
      ),
      toImageAsset(
        p5,
        'Plaques for the 2nd International Congress on Pineapple 2026, and three delegates wearing congress medals',
      ),
      toImageAsset(
        p6,
        'Covers of the ICBEST 2026 Conference Proceedings and of the 1st International Congress on Pineapple 2024 Scientific Program',
      ),
    ],
  },
  narrativeReport: {
    id: 'area-research-narrative',
    title: 'Research Narrative Profile',
    format: 'pdf',
    status: 'published',
    inline: true,
    source: { kind: 'local', path: '/files/research/narrative-profile.pdf' },
  },
  groups: [
    {
      id: 'area-research-documents',
      title: 'Documents',
      status: 'published',
      blocks: [
        {
          type: 'document',
          embed: true,
          resource: {
            id: 'area-research-icop-2024',
            title: 'ICoP 2024 (scanned copy)',
            format: 'pdf',
            status: 'published',
            inline: true,
            source: { kind: 'local', path: '/files/research/icop-2024.pdf' },
          },
        },
        {
          type: 'document',
          embed: true,
          resource: {
            id: 'area-research-ipr-policy',
            title: 'IPR Policy (BOT-Approved)',
            format: 'pdf',
            status: 'published',
            inline: true,
            source: { kind: 'local', path: '/files/research/ipr-policy.pdf' },
          },
        },
        {
          type: 'document',
          embed: true,
          resource: {
            id: 'area-research-completed-research',
            title: 'Completed Research (AACCUP)',
            format: 'pdf',
            status: 'published',
            inline: true,
            source: { kind: 'local', path: '/files/research/completed-research.pdf' },
          },
        },
      ],
    },
  ],
  additionalFiles: [],
  avp: { id: 'area-research-avp', title: 'Research AVP', format: 'video', status: 'pending' },
};

export default area;
