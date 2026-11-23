import type { Area } from '../../types/content';

// Published 2026-11-23 (user's choice) so Recommendation 1 can go live; the page shows "Materials for this page are
// being prepared" until the narrative report, photos and AVP arrive.

// File name must be the slug: this file is src/content/areas/community-service.ts
const area: Area = {
  slug: 'community-service',
  order: 3,
  title: 'Community Service',
  status: 'published',
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
