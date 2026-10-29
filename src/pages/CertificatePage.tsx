import { useRouteEntry } from '../app/useRouteEntry';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import NotFoundPage from './NotFoundPage';

export default function CertificatePage() {
  const entry = useRouteEntry();
  useDocumentTitle(entry?.title ?? 'Page not found');
  if (!entry) return <NotFoundPage />;
  return (
    <h1 id="page-title" tabIndex={-1}>
      {entry.title}
    </h1>
  );
}
