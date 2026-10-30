import { useRouteEntry } from '../app/useRouteEntry';
import { PageShell } from '../components/layout/PageShell';
import * as content from '../content';
import { collectPending } from '../features/content-status/collectPending';
import { ContentStatusView } from '../features/content-status/ContentStatusView';
import { showPending } from '../lib/published';
import NotFoundPage from './NotFoundPage';

export default function ContentStatusPage() {
  const entry = useRouteEntry();
  if (!entry || !showPending()) return <NotFoundPage />;
  return (
    <PageShell title={entry.title} hasContent>
      <ContentStatusView entries={collectPending(content)} />
    </PageShell>
  );
}
