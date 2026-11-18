import type { Recommendation } from '../../../types/content';

// File name must match the number: this file is src/content/recommendations/research/rec-02.ts
const recommendation: Recommendation = {
  areaSlug: 'research',
  number: 2,
  title: 'Recommendation 2',
  status: 'pending',
  document: {
    id: 'rec-research-02-document',
    title: 'Recommendation 2 document',
    format: 'pdf',
    status: 'pending',
  },
  evidence: [],
  additionalFiles: [],
};

export default recommendation;
