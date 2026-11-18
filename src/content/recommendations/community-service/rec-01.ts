import type { Recommendation } from '../../../types/content';

// File name must match the number: this file is src/content/recommendations/community-service/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 1,
  title: 'Recommendation 1',
  status: 'pending',
  document: {
    id: 'rec-community-service-01-document',
    title: 'Recommendation 1 document',
    format: 'pdf',
    status: 'pending',
  },
  evidence: [],
  additionalFiles: [],
};

export default recommendation;
