import { useRouteEntry } from '../app/useRouteEntry';
import { about } from '../content';
import { AboutView } from '../features/about/AboutView';
import NotFoundPage from './NotFoundPage';

export default function AboutPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <AboutView about={about} />;
}
