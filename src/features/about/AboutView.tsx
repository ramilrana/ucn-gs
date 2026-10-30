import { PendingNotice } from '../../components/content/PendingNotice';
import { Prose } from '../../components/content/Prose';
import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { showPending, slotValue } from '../../lib/published';
import type { AboutContent, Slot } from '../../types/content';

const TITLE = 'About the Graduate School';

interface Section {
  id: string;
  title: string;
  slots: readonly Slot<string[]>[];
}

/** A slot has something to show when it holds paragraphs, or (outside production) a pending notice. */
const slotRenders = (slot: Slot<string[]>): boolean => (slotValue(slot)?.length ?? 0) > 0 || showPending();

function SlotBlock({ slot, heading }: { slot: Slot<string[]>; heading: boolean }) {
  const paragraphs = slotValue(slot);
  if (!paragraphs || paragraphs.length === 0) return <PendingNotice label={slot.label} />;
  return (
    <div className="space-y-3">
      {heading && <SectionHeading level={3}>{slot.label}</SectionHeading>}
      <Prose paragraphs={paragraphs} />
    </div>
  );
}

/** Mission and Vision, Goals and Objectives, and History, each on a stable anchor. */
export function AboutView({ about }: { about: AboutContent }) {
  const sections: Section[] = [
    { id: 'mission-and-vision', title: 'Mission and Vision', slots: [about.mission, about.vision] },
    { id: 'goals-and-objectives', title: 'Goals and Objectives', slots: [about.goals, about.objectives] },
    { id: 'history', title: 'History', slots: [about.history] },
  ];
  const shown = sections.filter((section) => section.slots.some(slotRenders));
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
                    className="inline-flex min-h-6 items-center text-maroon-800 underline underline-offset-4"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {shown.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-6 space-y-6">
            <SectionHeading level={2} id={`${section.id}-title`}>
              {section.title}
            </SectionHeading>
            {section.slots.map((slot) => (
              <SlotBlock key={slot.label} slot={slot} heading={section.slots.length > 1} />
            ))}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
