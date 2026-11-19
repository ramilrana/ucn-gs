import { useLocation } from 'react-router-dom';
import { PendingNotice } from '../../components/content/PendingNotice';
import { Prose } from '../../components/content/Prose';
import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { showPending, slotValue } from '../../lib/published';
import { useFocusHashTarget } from '../../lib/useFocusHashTarget';
import type { AboutContent, ProgramText, Slot } from '../../types/content';

const TITLE = 'About the Graduate School';

/** One piece of a section: paragraphs, a bulleted list, or per-program text (objectives as lists, descriptions as paragraphs). */
type Part =
  | { kind: 'paragraphs'; slot: Slot<string[]> }
  | { kind: 'list'; slot: Slot<string[]> }
  | { kind: 'programs'; slot: Slot<ProgramText[]>; as: 'list' | 'paragraphs' };

interface Section {
  id: string;
  title: string;
  /** Show each part's label as an h3 (sections with several labelled parts). */
  labelled: boolean;
  parts: readonly Part[];
}

/** A slot has something to show when it holds items, or (outside production) a pending notice. */
const slotRenders = (slot: Slot<readonly unknown[]>): boolean => (slotValue(slot)?.length ?? 0) > 0 || showPending();

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="max-w-[70ch] list-disc space-y-2 pl-6 leading-relaxed text-ink marker:text-maroon-800">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Programs({ programs, as, level }: { programs: readonly ProgramText[]; as: 'list' | 'paragraphs'; level: 3 | 4 }) {
  return (
    <div className="space-y-8">
      {programs.map((program) => (
        <div key={program.program} className="space-y-3">
          {level === 3 ? (
            <SectionHeading level={3}>{program.program}</SectionHeading>
          ) : (
            <h4 className="font-serif text-lg font-semibold text-maroon-800">{program.program}</h4>
          )}
          {as === 'list' ? <BulletList items={program.text} /> : <Prose paragraphs={program.text} />}
        </div>
      ))}
    </div>
  );
}

function PartBlock({ part, labelled }: { part: Part; labelled: boolean }) {
  const value = slotValue<readonly unknown[]>(part.slot);
  if (!value || value.length === 0) return <PendingNotice label={part.slot.label} />;
  let body;
  if (part.kind === 'paragraphs') body = <Prose paragraphs={value as string[]} />;
  else if (part.kind === 'list') body = <BulletList items={value as string[]} />;
  else body = <Programs programs={value as ProgramText[]} as={part.as} level={labelled ? 4 : 3} />;
  return (
    <div className="space-y-3">
      {labelled && <SectionHeading level={3}>{part.slot.label}</SectionHeading>}
      {body}
    </div>
  );
}

/** Mission and Vision, Goals and Objectives, Program Description, and History, each on a stable anchor. */
export function AboutView({ about }: { about: AboutContent }) {
  const { hash, key } = useLocation();
  const sections: Section[] = [
    {
      id: 'mission-and-vision',
      title: 'Mission and Vision',
      labelled: true,
      parts: [
        { kind: 'paragraphs', slot: about.vision },
        { kind: 'paragraphs', slot: about.mission },
      ],
    },
    {
      id: 'goals-and-objectives',
      title: 'Goals and Objectives',
      labelled: true,
      parts: [
        { kind: 'paragraphs', slot: about.goals },
        { kind: 'programs', slot: about.objectives, as: 'list' },
      ],
    },
    {
      id: 'program-description',
      title: 'Program Description',
      labelled: false,
      parts: [{ kind: 'programs', slot: about.programDescriptions, as: 'paragraphs' }],
    },
    {
      id: 'history',
      title: 'History',
      labelled: false,
      parts: [
        { kind: 'paragraphs', slot: about.history },
        { kind: 'list', slot: about.deans },
      ],
    },
  ];
  const shown = sections.filter((section) => section.parts.some((part) => slotRenders(part.slot)));
  useFocusHashTarget(
    hash,
    shown.map((section) => section.id),
    key,
  );
  const photo = slotValue(about.photo);
  const photoRenders = photo !== undefined || showPending();

  return (
    <PageShell title={TITLE} hasContent={photoRenders || shown.length > 0}>
      <div className="space-y-12">
        {photo ? (
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            className="h-auto max-h-[28rem] w-full rounded object-cover"
          />
        ) : (
          <PendingNotice label={about.photo.label} />
        )}
        {shown.length > 0 && (
          <nav aria-label="On this page">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {shown.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex min-h-11 items-center text-maroon-800 underline underline-offset-4"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {shown.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="space-y-6">
            <SectionHeading level={2} id={`${section.id}-title`} tabIndex={-1} className="scroll-mt-6">
              {section.title}
            </SectionHeading>
            {section.parts
              .filter((part) => slotRenders(part.slot))
              .map((part) => (
                <PartBlock key={part.slot.label} part={part} labelled={section.labelled} />
              ))}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
