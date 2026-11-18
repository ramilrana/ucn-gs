import { useRouteEntry } from '../app/useRouteEntry';
import { areas, compliance, recommendations } from '../content';
import { ComplianceIndexView } from '../features/compliance/ComplianceIndexView';
import NotFoundPage from './NotFoundPage';

export default function ComplianceIndexPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <ComplianceIndexView overview={compliance.overview} areas={areas} recommendations={recommendations} />;
}
