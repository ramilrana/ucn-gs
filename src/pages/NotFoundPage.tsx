import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <h1 id="page-title" tabIndex={-1}>
      Page not found
    </h1>
  );
}
