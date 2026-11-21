import { PageShell } from '../../components/layout/PageShell';
import { slotValue } from '../../lib/published';
import type { ProgramFaculty, Slot } from '../../types/content';

const TITLE = 'Faculty of Programs';

const headingId = (index: number) => `faculty-list-${index + 1}`;

/** A small round list number; the list is an <ol>, so the number is decorative for assistive technology. */
function ListNumber({ n, onMaroon = false }: { n: number; onMaroon?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-semibold tabular-nums ${
        onMaroon ? 'border-gold-500 text-gold-500' : 'border-maroon-800/30 text-maroon-800'
      }`}
    >
      {n}
    </span>
  );
}

/** A list whose members all have a role (the program chairpersons): a maroon band, names in white, roles in gold. */
function FeaturedList({ list, index }: { list: ProgramFaculty; index: number }) {
  return (
    <section
      aria-labelledby={headingId(index)}
      className="on-maroon rounded bg-maroon-800 px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10"
    >
      <h2 id={headingId(index)} className="font-serif text-2xl font-semibold sm:text-3xl">
        {list.title}
      </h2>
      <div aria-hidden="true" className="mt-4 h-[3px] w-16 bg-gold-500" />
      <ol className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.members.map((member, i) => (
          <li key={`${member.name}-${i}`} className="flex gap-3">
            <ListNumber n={i + 1} onMaroon />
            <div>
              <p className="font-serif text-lg font-semibold leading-snug">{member.name}</p>
              {member.role && <p className="mt-0.5 text-sm font-medium tracking-wide text-gold-500">{member.role}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** One program's faculty: a white card with a maroon top edge, the program as its heading, a numbered list of names. */
function ProgramCard({ list, index }: { list: ProgramFaculty; index: number }) {
  return (
    <section
      aria-labelledby={headingId(index)}
      className="flex flex-col rounded border border-t-4 border-line border-t-maroon-800 bg-white shadow-sm"
    >
      <div className="border-b border-line bg-paper px-5 py-5 sm:px-6">
        <h2 id={headingId(index)} className="font-serif text-xl font-semibold leading-snug text-maroon-800">
          {list.title}
        </h2>
        <div aria-hidden="true" className="mt-3 h-[3px] w-12 bg-gold-500" />
      </div>
      <ol className="divide-y divide-line px-5 sm:px-6">
        {list.members.map((member, i) => (
          <li key={`${member.name}-${i}`} className="flex items-start gap-3 py-3">
            <ListNumber n={i + 1} />
            <div>
              <p className="leading-snug text-ink">{member.name}</p>
              {member.role && <p className="text-sm text-ink-muted">{member.role}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Faculty of Programs (user's request 2026-11-21, replacing Faculty by Department): text only, no photos. Lists in
 * which every member has a role (the chairpersons) are featured full width; the program lists follow as cards, two
 * to a row from lg.
 */
export function FacultyOfProgramsView({ faculty }: { faculty: Slot<ProgramFaculty[]> }) {
  const lists = (slotValue(faculty) ?? []).map((list, index) => ({ list, index }));
  const featured = lists.filter(({ list }) => list.members.length > 0 && list.members.every((m) => m.role));
  const programs = lists.filter((entry) => !featured.includes(entry));
  return (
    <PageShell title={TITLE} hasContent={lists.length > 0}>
      <div className="space-y-12">
        {featured.map(({ list, index }) => (
          <FeaturedList key={index} list={list} index={index} />
        ))}
        {programs.length > 0 && (
          <div className="grid items-start gap-8 lg:grid-cols-2">
            {programs.map(({ list, index }) => (
              <ProgramCard key={index} list={list} index={index} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
