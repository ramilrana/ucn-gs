import { useRouteEntry } from '../app/useRouteEntry';
import { areas, recommendations } from '../content';
import { routeManifest } from '../content/routes';
import { areaEyebrow } from '../lib/areaLabel';
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
  const area = areas.find((a) => a.slug === rec.areaSlug);
  return (
    <RecommendationView
      rec={rec}
      title={entry.title}
      path={entry.path}
      siblings={siblings}
      eyebrow={area ? areaEyebrow(area.order) : undefined}
    />
  );
}
