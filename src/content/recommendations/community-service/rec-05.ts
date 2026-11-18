import type { Recommendation } from '../../../types/content';

// File name must match the number: this file is src/content/recommendations/community-service/rec-05.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 5,
  title: 'Recommendation 5',
  status: 'pending',
  document: {
    id: 'rec-community-service-05-document',
    title: 'Recommendation 5 document',
    format: 'pdf',
    status: 'pending',
  },
  evidence: [],
  additionalFiles: [],
};

export default recommendation;
