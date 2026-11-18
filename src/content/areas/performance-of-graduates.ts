import type { Area } from '../../types/content';

// File name must be the slug: this file is src/content/areas/performance-of-graduates.ts
const area: Area = {
  slug: 'performance-of-graduates',
  order: 2,
  title: 'Performance of Graduates',
  status: 'pending',
  gallery: { status: 'pending', label: 'Performance of Graduates photo gallery' },
  narrativeReport: {
    id: 'area-performance-of-graduates-narrative',
    title: 'Performance of Graduates Narrative Report',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
  avp: { id: 'area-performance-of-graduates-avp', title: 'Performance of Graduates AVP', format: 'video', status: 'pending' },
};

export default area;
