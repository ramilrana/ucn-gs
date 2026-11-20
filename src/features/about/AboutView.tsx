import { useLocation } from 'react-router-dom';
import { PendingNotice } from '../../components/content/PendingNotice';
import { Prose } from '../../components/content/Prose';
import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { showPending, slotValue } from '../../lib/published';
import { focusSectionHeading, useFocusHashTarget } from '../../lib/useFocusHashTarget';
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

function BulletList({ items, label }: { items: readonly string[]; label?: string }) {
  return (
    <ul aria-label={label} className="max-w-[70ch] list-disc space-y-2 pl-6 leading-relaxed text-ink marker:text-maroon-800">
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
  // Without a visible h3 (History's deans list), the slot label still names the list for screen readers.
  else if (part.kind === 'list') body = <BulletList items={value as string[]} label={labelled ? undefined : part.slot.label} />;
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
      id: 'quality-policy',
      title: 'Quality Policy',
      labelled: false,
      parts: [{ kind: 'paragraphs', slot: about.qualityPolicy }],
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
          // A labelled bar of button-style links, so the section list reads as navigation, not as body text.
          <nav aria-label="On this page" className="rounded border border-line bg-paper p-4 sm:p-5">
            <p aria-hidden="true" className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              On this page
            </p>
            <ul className="flex flex-wrap gap-3">
              {shown.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => {
                      // Same hash again: the router sees no new location, and the browser's own fragment navigation
                      // (to the unfocusable section) would reset focus to the page. Nothing changes in the URL, so
                      // skip it and scroll and focus the section title here.
                      // Modified clicks (new tab or window) keep their normal behaviour.
                      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      if (hash !== `#${section.id}`) return;
                      event.preventDefault();
                      focusSectionHeading(section.id);
                    }}
                    className="inline-flex min-h-11 items-center rounded-full border-2 border-maroon-800 bg-white px-5 font-semibold text-maroon-800 transition-colors hover:bg-maroon-800 hover:text-white"
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
            {/* Section titles sit on a maroon band (gold edge is decorative, on maroon: D9) so they stand apart from
                the plain maroon h3 subtitles. on-maroon gives the programmatic-focus ring its gold colour. */}
            <div className="on-maroon rounded border-l-8 border-gold-500 bg-maroon-800 px-5 py-3 sm:px-6 sm:py-4">
              <h2
                id={`${section.id}-title`}
                tabIndex={-1}
                className="scroll-mt-10 font-serif text-2xl font-semibold text-white sm:text-3xl"
              >
                {section.title}
              </h2>
            </div>
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
