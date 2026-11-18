import type { Area } from '../../types/content';

// File name must be the slug: this file is src/content/areas/community-service.ts
const area: Area = {
  slug: 'community-service',
  order: 3,
  title: 'Community Service',
  status: 'pending',
  gallery: { status: 'pending', label: 'Community Service photo gallery' },
  narrativeReport: {
    id: 'area-community-service-narrative',
    title: 'Community Service Narrative Report',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
  avp: { id: 'area-community-service-avp', title: 'Community Service AVP', format: 'video', status: 'pending' },
};

export default area;
