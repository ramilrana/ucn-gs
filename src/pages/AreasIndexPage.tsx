import { useRouteEntry } from '../app/useRouteEntry';
import { areas, site } from '../content';
import { AreasIndexView } from '../features/areas/AreasIndexView';
import NotFoundPage from './NotFoundPage';

export default function AreasIndexPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <AreasIndexView areas={areas} label={site.areasLabel} />;
}
