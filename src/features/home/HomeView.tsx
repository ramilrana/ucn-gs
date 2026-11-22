import type { ReactNode } from 'react';
import { PendingNotice } from '../../components/content/PendingNotice';
import { HeroCarousel } from '../../components/media/HeroCarousel';
import { ActionLink } from '../../components/ui/ActionLink';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { showPending, slotValue } from '../../lib/published';
import type { AboutContent, HomeContent, ImageAsset, SiteContent, Slot } from '../../types/content';
import { HomeHero } from './HomeHero';
import { LeaderMessageCard } from './LeaderMessageCard';
import { QuickAccess } from './QuickAccess';

interface HomeViewProps {
  home: HomeContent;
  about: AboutContent;
  site: SiteContent;
  /** Dev/preview-only stand-in photos for messages without a real photo. Production passes none. */
  messagePlaceholders?: Partial<Record<'president' | 'dean' | 'programChair', ImageAsset>>;
}

const wrap = 'mx-auto max-w-7xl px-4 sm:px-6';

/** A slot holding paragraphs or images has something to show; outside production a pending slot shows its notice. */
const listRenders = (slot: Slot<readonly unknown[]>): boolean => (slotValue(slot)?.length ?? 0) > 0 || showPending();
const singleRenders = (slot: Slot<unknown>): boolean => slotValue(slot) !== undefined || showPending();

interface Preview {
  id: string;
  title: string;
  slots: readonly Slot<string[]>[];
}

function PreviewBlock({ preview }: { preview: Preview }) {
  const labelled = preview.slots.length > 1;
  return (
    <div className="space-y-4">
      <SectionHeading level={3}>{preview.title}</SectionHeading>
      <div className="space-y-3">
        {preview.slots.map((slot) => {
          const first = slotValue(slot)?.[0];
          if (first === undefined) return <PendingNotice key={slot.label} label={slot.label} />;
          return (
            <p key={slot.label} className="max-w-[70ch] leading-relaxed text-ink">
              {labelled && <span className="font-semibold text-maroon-800">{slot.label}. </span>}
              {first}
            </p>
          );
        })}
      </div>
      <ActionLink href={`/about#${preview.id}`}>Read more about {preview.title}</ActionLink>
    </div>
  );
}

function Band({ children }: { children: ReactNode }) {
  return <div className={`${wrap} mt-12 sm:mt-14`}>{children}</div>;
}

/** The Home page, in spec section 4 order. Each section renders only when its slot is published (or, in dev, pending). */
export function HomeView({ home, about, site, messagePlaceholders = {} }: HomeViewProps) {
  const programName = slotValue(site.programName);
  const leadership = slotValue(home.leadershipSlides);
  const accreditation = slotValue(home.accreditationSlides);
  const president = slotValue(home.presidentMessage);
  const dean = slotValue(home.deanMessage);
  const chair = slotValue(home.programChairMessage);
  const aboutPhoto = slotValue(about.photo);

  const previews: Preview[] = [
    { id: 'mission-and-vision', title: 'Mission and Vision', slots: [about.vision, about.mission] },
    // Objectives are per-program lists, so the preview quotes the goal paragraph only.
    { id: 'goals-and-objectives', title: 'Goals and Objectives', slots: [about.goals] },
    { id: 'history', title: 'History', slots: [about.history] },
  ].filter((preview) => preview.slots.some(listRenders));

  const showLeadership = listRenders(home.leadershipSlides);
  const showAccreditation = listRenders(home.accreditationSlides);
  const showMessages =
    singleRenders(home.presidentMessage) || singleRenders(home.deanMessage) || singleRenders(home.programChairMessage);
  const showAbout = singleRenders(about.photo) || previews.length > 0;
  // In production with everything pending, none of these is true and the page says so instead of ending after the heading.
  const hasAnything =
    showLeadership || showAccreditation || showMessages || showAbout;

  return (
    <>
      <HomeHero universityName={site.universityName} schoolName={site.schoolName} programName={programName} />

      {showLeadership &&
        (leadership && leadership.length > 0 ? (
          // Full viewport width, edge to edge (user's request 2026-11-20).
          <HeroCarousel label="Graduate School leadership" slides={leadership} />
        ) : (
          <div className="on-maroon bg-maroon-800 text-white">
            <div className={`${wrap} py-8 sm:py-10`}>
              <PendingNotice label={home.leadershipSlides.label} />
            </div>
          </div>
        ))}

      <QuickAccess areasLabel={site.areasLabel} />

      <div className="pb-12 sm:pb-16">
        <Band>
          <div className="text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-maroon-800 sm:text-3xl">
              {home.accreditationHeading}
            </h2>
            <div aria-hidden="true" className="mx-auto mt-4 h-[3px] w-16 bg-gold-500" />
          </div>
        </Band>

        {showAccreditation &&
          (accreditation && accreditation.length > 0 ? (
            // Full viewport width like the leadership carousel; 4:3 photos, so slides stop at 800px wide (600px tall).
            <div className="mt-8">
              <HeroCarousel label="MPA accreditation photographs" slides={accreditation} slideMaxWidth={800} />
            </div>
          ) : (
            <Band>
              <PendingNotice label={home.accreditationSlides.label} />
            </Band>
          ))}

        {showMessages && (
          <Band>
            <section aria-labelledby="messages-title" className="space-y-6">
              <SectionHeading level={2} id="messages-title">
                Messages
              </SectionHeading>
              {/* President, Dean, then Program Chair, stacked: the messages are long and read better full width. */}
              <div className="grid grid-cols-1 gap-6">
                {president ? (
                  <LeaderMessageCard message={president} placeholderPhoto={messagePlaceholders.president} />
                ) : (
                  <PendingNotice label={home.presidentMessage.label} />
                )}
                {dean ? (
                  <LeaderMessageCard message={dean} placeholderPhoto={messagePlaceholders.dean} />
                ) : (
                  <PendingNotice label={home.deanMessage.label} />
                )}
                {chair ? (
                  <LeaderMessageCard message={chair} placeholderPhoto={messagePlaceholders.programChair} />
                ) : (
                  <PendingNotice label={home.programChairMessage.label} />
                )}
              </div>
            </section>
          </Band>
        )}

        {showAbout && (
          <Band>
            <section aria-labelledby="about-title" className="space-y-8">
              <SectionHeading level={2} id="about-title">
                About the Graduate School
              </SectionHeading>
              {aboutPhoto ? (
                <img
                  src={aboutPhoto.src}
                  srcSet={aboutPhoto.srcSet}
                  sizes="(min-width: 1280px) 1216px, 100vw"
                  width={aboutPhoto.width}
                  height={aboutPhoto.height}
                  alt={aboutPhoto.alt}
                  loading="lazy"
                  className="h-auto max-h-[28rem] w-full rounded object-cover"
                />
              ) : (
                <PendingNotice label={about.photo.label} />
              )}
              {previews.length > 0 && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {previews.map((preview) => (
                    <PreviewBlock key={preview.id} preview={preview} />
                  ))}
                </div>
              )}
            </section>
          </Band>
        )}

        {!hasAnything && (
          <Band>
            <p className="max-w-[70ch] text-ink-muted">Accreditation materials are being prepared.</p>
          </Band>
        )}
      </div>
    </>
  );
}
