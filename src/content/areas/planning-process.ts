import type { Area } from '../../types/content';

// File name must be the slug: this file is src/content/areas/planning-process.ts
const area: Area = {
  slug: 'planning-process',
  order: 5,
  title: 'Planning Process',
  status: 'pending',
  gallery: { status: 'pending', label: 'Planning Process photo gallery' },
  narrativeReport: {
    id: 'area-planning-process-narrative',
    title: 'Planning Process Narrative Report',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
  avp: { id: 'area-planning-process-avp', title: 'Planning Process AVP', format: 'video', status: 'pending' },
};

export default area;
