import type { Area } from '../../types/content';

// Renamed 2026-11-23 from "Performance of Graduates" (slug performance-of-graduates) at the user's request.

// File name must be the slug: this file is src/content/areas/teaching-and-learning.ts
const area: Area = {
  slug: 'teaching-and-learning',
  order: 2,
  title: 'Teaching and Learning',
  status: 'pending',
  gallery: { status: 'pending', label: 'Teaching and Learning photo gallery' },
  narrativeReport: {
    id: 'area-teaching-and-learning-narrative',
    title: 'Teaching and Learning Narrative Report',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
  avp: { id: 'area-teaching-and-learning-avp', title: 'Teaching and Learning AVP', format: 'video', status: 'pending' },
};

export default area;
