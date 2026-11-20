import { about, home, messagePlaceholders, site } from '../content';
import { HomeView } from '../features/home/HomeView';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle('Home');
  return <HomeView home={home} about={about} site={site} messagePlaceholders={messagePlaceholders} />;
}
