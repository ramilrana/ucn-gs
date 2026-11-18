import type { Area } from '../../types/content';

// File name must be the slug: this file is src/content/areas/international-linkages-and-consortia.ts
const area: Area = {
  slug: 'international-linkages-and-consortia',
  order: 4,
  title: 'International Linkages & Consortia',
  status: 'pending',
  gallery: { status: 'pending', label: 'International Linkages & Consortia photo gallery' },
  narrativeReport: {
    id: 'area-international-linkages-and-consortia-narrative',
    title: 'International Linkages & Consortia Narrative Report',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
  avp: { id: 'area-international-linkages-and-consortia-avp', title: 'International Linkages & Consortia AVP', format: 'video', status: 'pending' },
};

export default area;
