import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { visible } from '../../lib/published';
import type { Person } from '../../types/content';
import { PersonCard } from './PersonCard';
import { groupByDepartment } from './groupPeople';

const TITLE = 'Faculty by Department';

/** Faculty only, one section per department. */
export function FacultyByDepartmentView({ people }: { people: readonly Person[] }) {
  const groups = groupByDepartment(visible(people));
  return (
    <PageShell title={TITLE} hasContent={groups.length > 0}>
      <div className="space-y-12">
        {groups.map((group, index) => {
          const id = `department-${index}`;
          return (
            <section key={group.department} aria-labelledby={id} className="space-y-6">
              <SectionHeading level={2} id={id}>
                {group.department}
              </SectionHeading>
              <ul className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.people.map((person) => (
                  <li key={person.id}>
                    <PersonCard person={person} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
