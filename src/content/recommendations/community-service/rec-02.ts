import type { Recommendation } from '../../../types/content';

// File name must match the number: this file is src/content/recommendations/community-service/rec-02.ts
const recommendation: Recommendation = {
  areaSlug: 'community-service',
  number: 2,
  title: 'Recommendation 2',
  status: 'pending',
  document: {
    id: 'rec-community-service-02-document',
    title: 'Recommendation 2 document',
    format: 'pdf',
    status: 'pending',
  },
  evidence: [],
  additionalFiles: [],
};

export default recommendation;
