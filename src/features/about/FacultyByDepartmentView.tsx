import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { visible } from '../../lib/published';
import type { Person } from '../../types/content';
import { PEOPLE_GRID } from './PeopleView';
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
              <ul className={PEOPLE_GRID}>
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
