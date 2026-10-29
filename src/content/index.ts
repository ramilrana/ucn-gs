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

export const areas: Area[] = Object.values(areaModules).sort((a, b) => a.order - b.order);
export const recommendations: Recommendation[] = Object.values(recommendationModules).sort((a, b) => a.number - b.number);
