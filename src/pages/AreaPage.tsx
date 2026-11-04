import { useRouteEntry } from '../app/useRouteEntry';
import { areas } from '../content';
import { routeManifest } from '../content/routes';
import { AreaView } from '../features/areas/AreaView';
import NotFoundPage from './NotFoundPage';

const siblings = routeManifest
  .filter((route) => route.kind === 'area')
  .map(({ title, path }) => ({ title, path }));

export default function AreaPage() {
  const entry = useRouteEntry();
  const area = entry?.slug === undefined ? undefined : areas.find((a) => a.slug === entry.slug);
  if (!entry || !area) return <NotFoundPage />;
  return <AreaView area={area} siblings={siblings} />;
}
