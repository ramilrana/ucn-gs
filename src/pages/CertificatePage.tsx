import { useRouteEntry } from '../app/useRouteEntry';
import { certificate } from '../content';
import { CertificateView } from '../features/documents/CertificateView';
import NotFoundPage from './NotFoundPage';

export default function CertificatePage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <CertificateView certificate={certificate} />;
}
