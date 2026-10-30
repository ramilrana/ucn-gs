import { useRouteEntry } from '../app/useRouteEntry';
import { additionalFiles } from '../content';
import { AdditionalFilesView } from '../features/documents/AdditionalFilesView';
import NotFoundPage from './NotFoundPage';

export default function AdditionalFilesPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <AdditionalFilesView groups={additionalFiles} />;
}
