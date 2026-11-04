import { useRouteEntry } from '../app/useRouteEntry';
import { faqs, site } from '../content';
import { FaqsLocationView } from '../features/about/FaqsLocationView';
import NotFoundPage from './NotFoundPage';

export default function FaqsLocationPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <FaqsLocationView faqs={faqs} site={site} />;
}
