import { useRouteEntry } from '../app/useRouteEntry';
import { facultyOfPrograms } from '../content/facultyOfPrograms';
import { FacultyOfProgramsView } from '../features/about/FacultyOfProgramsView';
import NotFoundPage from './NotFoundPage';

export default function FacultyOfProgramsPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <FacultyOfProgramsView faculty={facultyOfPrograms} />;
}
