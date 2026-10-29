import { site } from '../content';
import { useRouteEntry } from '../app/useRouteEntry';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function HomePage() {
  const entry = useRouteEntry();
  useDocumentTitle(entry?.title ?? 'Home');
  return (
    <h1 id="page-title" tabIndex={-1}>
      {`${site.universityName} Graduate School`}
    </h1>
  );
}
