import type { Recommendation } from '../../../types/content';

// File name must match the number: this file is src/content/recommendations/community-service/rec-03.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 3,
  title: 'Recommendation 3',
  status: 'pending',
  document: {
    id: 'rec-community-service-03-document',
    title: 'Recommendation 3 document',
    format: 'pdf',
    status: 'pending',
  },
  evidence: [],
  additionalFiles: [],
};

export default recommendation;
