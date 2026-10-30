import { sampleAreas, sampleRecommendations } from '../dev/samples';
import type { Area, Recommendation } from '../types/content';

export { site } from './site';
export { home } from './home';
export { about } from './about';
export { people } from './people';
export { faqs } from './faqs';
export { certificate, additionalFiles } from './documents';
export { compliance } from './compliance';

const areaModules = import.meta.glob<Area>(['./areas/*.ts', '!./areas/*.test.ts'], { eager: true, import: 'default' });
const recommendationModules = import.meta.glob<Recommendation>(['./recommendations/rec-*.ts', '!./recommendations/*.test.ts'], {
  eager: true,
  import: 'default',
});

/** Content files only, never samples. Use these where "real content" is meant (route list, status checklist, file checks). */
export const contentAreas: Area[] = Object.values(areaModules).sort((a, b) => a.order - b.order);
export const contentRecommendations: Recommendation[] = Object.values(recommendationModules).sort((a, b) => a.number - b.number);

// Written inline so Rollup folds it to `false` in production builds and drops src/dev/samples.ts.
// `npm run check:dist` fails if a DEV-SAMPLE id reaches dist/.
const includeSamples = import.meta.env.DEV || import.meta.env.VITE_CONTENT_PREVIEW === 'true';

export const areas: Area[] = includeSamples ? [...contentAreas, ...sampleAreas] : contentAreas;
export const recommendations: Recommendation[] = includeSamples
  ? [...contentRecommendations, ...sampleRecommendations]
  : contentRecommendations;
