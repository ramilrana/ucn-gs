import { useRouteEntry } from '../app/useRouteEntry';
import { recommendations } from '../content';
import { routeManifest } from '../content/routes';
import { RecommendationView } from '../features/compliance/RecommendationView';
import NotFoundPage from './NotFoundPage';

// Every recommendation in manifest order (area order, then number), so the pager runs across areas.
const siblings = routeManifest
  .filter((route) => route.kind === 'recommendation')
  .map(({ title, path }) => ({ title, path }));

export default function RecommendationPage() {
  const entry = useRouteEntry();
  const rec =
    entry?.number === undefined || entry.slug === undefined
      ? undefined
      : recommendations.find((r) => r.areaSlug === entry.slug && r.number === entry.number);
  if (!entry || !rec) return <NotFoundPage />;
  return <RecommendationView rec={rec} title={entry.title} path={entry.path} siblings={siblings} />;
}
