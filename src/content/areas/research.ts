import type { Area } from '../../types/content';

// File name must be the slug: this file is src/content/areas/research.ts
const area: Area = {
  slug: 'research',
  order: 1,
  title: 'Research',
  status: 'pending',
  gallery: { status: 'pending', label: 'Research photo gallery' },
  narrativeReport: {
    id: 'area-research-narrative',
    title: 'Research Narrative Report',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
  avp: { id: 'area-research-avp', title: 'Research AVP', format: 'video', status: 'pending' },
};

export default area;
