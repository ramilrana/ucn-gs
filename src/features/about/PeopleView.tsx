import { PageShell } from '../../components/layout/PageShell';
import { visible } from '../../lib/published';
import type { Person } from '../../types/content';
import { PersonCard } from './PersonCard';
import { groupByRole } from './groupPeople';

const TITLE = 'Faculty, Staff and Student Assistants';

/** Three to a row from md up (user's request 2026-11-21); two, then one, on narrower screens. */
const PEOPLE_GRID = 'grid grid-cols-1 gap-x-8 gap-y-12 min-[480px]:grid-cols-2 md:grid-cols-3';

/** Officials (featured), then faculty, staff and student assistants, each group in the content's order. */
export function PeopleView({ people }: { people: readonly Person[] }) {
  const groups = groupByRole(visible(people));
  return (
    <PageShell title={TITLE} hasContent={groups.length > 0}>
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.role} aria-labelledby={`people-${group.role}`} className="space-y-6">
            {/* Group titles on a maroon band with a gold left edge, like the About section titles (the user's pick of four
                previewed styles, 2026-11-22). Gold only on maroon (D9). */}
            <div className="on-maroon rounded border-l-8 border-gold-500 bg-maroon-800 px-5 py-3 sm:px-6 sm:py-4">
              <h2 id={`people-${group.role}`} className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                {group.label}
              </h2>
            </div>
            {group.role === 'official' ? (
              // The officials (the President and the Dean) come first, one per row, photo beside the name (the user's pick
              // of three previewed layouts, 2026-11-21).
              <ul className="grid grid-cols-1 gap-y-6">
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

