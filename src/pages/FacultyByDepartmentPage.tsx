import { useRouteEntry } from '../app/useRouteEntry';
import { people } from '../content';
import { FacultyByDepartmentView } from '../features/about/FacultyByDepartmentView';
import NotFoundPage from './NotFoundPage';

export default function FacultyByDepartmentPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <FacultyByDepartmentView people={people} />;
}
