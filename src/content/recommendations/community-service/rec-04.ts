import type { Recommendation } from '../../../types/content';

// File name must match the number: this file is src/content/recommendations/community-service/rec-04.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 4,
  title: 'Recommendation 4',
  status: 'pending',
  document: {
    id: 'rec-community-service-04-document',
    title: 'Recommendation 4 document',
    format: 'pdf',
    status: 'pending',
  },
  evidence: [],
  additionalFiles: [],
};

export default recommendation;
