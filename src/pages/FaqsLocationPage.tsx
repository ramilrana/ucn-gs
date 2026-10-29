import { useRouteEntry } from '../app/useRouteEntry';
import { PageShell } from '../components/layout/PageShell';
import NotFoundPage from './NotFoundPage';

export default function FaqsLocationPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <PageShell title={entry.title} hasContent={false} />;
}
