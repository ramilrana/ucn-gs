import { useRouteEntry } from '../app/useRouteEntry';
import { recommendations } from '../content';
import { routeManifest } from '../content/routes';
import { RecommendationView } from '../features/compliance/RecommendationView';
import NotFoundPage from './NotFoundPage';

const siblings = routeManifest
  .filter((route) => route.kind === 'recommendation')
  .map(({ title, path }) => ({ title, path }));

export default function RecommendationPage() {
  const entry = useRouteEntry();
  const rec = entry?.number === undefined ? undefined : recommendations.find((r) => r.number === entry.number);
  if (!entry || !rec) return <NotFoundPage />;
  return <RecommendationView rec={rec} siblings={siblings} />;
}
