import { useRouteEntry } from '../app/useRouteEntry';
import { people } from '../content';
import { PeopleView } from '../features/about/PeopleView';
import NotFoundPage from './NotFoundPage';

export default function PeoplePage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <PeopleView people={people} />;
}
