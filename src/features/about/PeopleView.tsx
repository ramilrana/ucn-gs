import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { visible } from '../../lib/published';
import type { Person } from '../../types/content';
import { PersonCard } from './PersonCard';
import { groupByRole } from './groupPeople';

const TITLE = 'Faculty, Staff and Student Assistants';

/** Officials, faculty, staff and student assistants as grouped grids of cards. */
export function PeopleView({ people }: { people: readonly Person[] }) {
  const groups = groupByRole(visible(people));
  return (
    <PageShell title={TITLE} hasContent={groups.length > 0}>
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.role} aria-labelledby={`people-${group.role}`} className="space-y-6">
            <SectionHeading level={2} id={`people-${group.role}`}>
              {group.label}
            </SectionHeading>
            <ul className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.people.map((person) => (
                <li key={person.id}>
                  <PersonCard person={person} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
