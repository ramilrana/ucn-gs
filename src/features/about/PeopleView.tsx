import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { visible } from '../../lib/published';
import type { Person } from '../../types/content';
import { PersonCard } from './PersonCard';
import { groupByRole } from './groupPeople';

const TITLE = 'Faculty, Staff and Student Assistants';

/** Three to a row from md up (user's request 2026-11-21); two, then one, on narrower screens. */
export const PEOPLE_GRID = 'grid grid-cols-1 gap-x-8 gap-y-12 min-[480px]:grid-cols-2 md:grid-cols-3';

/** Officials (featured), then faculty, staff and student assistants, each group in the content's order. */
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
            {group.role === 'official' ? (
              // The officials (the President and the Dean) come first and larger, two to a row.
              <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
                {group.people.map((person) => (
                  <li key={person.id}>
                    <PersonCard person={person} size="featured" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={PEOPLE_GRID}>
                {group.people.map((person) => (
                  <li key={person.id}>
                    <PersonCard person={person} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
