import type { ReactNode } from 'react';
import { PendingNotice } from '../../components/content/PendingNotice';
import { ImageGallery } from '../../components/media/ImageGallery';
import { Slideshow } from '../../components/media/Slideshow';
import { VideoEmbed } from '../../components/media/VideoEmbed';
import { ActionLink } from '../../components/ui/ActionLink';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { isVisible, showPending, slotValue } from '../../lib/published';
import type { AboutContent, HomeContent, ImageAsset, SiteContent, Slot } from '../../types/content';
import { LeaderMessageCard } from './LeaderMessageCard';
import { QuickAccess } from './QuickAccess';

interface HomeViewProps {
  home: HomeContent;
  about: AboutContent;
  site: SiteContent;
}

const wrap = 'mx-auto max-w-7xl px-4 sm:px-6';

/** A slot holding paragraphs or images has something to show; outside production a pending slot shows its notice. */
const listRenders = (slot: Slot<readonly unknown[]>): boolean => (slotValue(slot)?.length ?? 0) > 0 || showPending();
const singleRenders = (slot: Slot<unknown>): boolean => slotValue(slot) !== undefined || showPending();
const videoRenders = (video: HomeContent['video']): boolean =>
  isVisible(video) && (video.source !== undefined || showPending());

function SlideImage({ slot }: { slot: Slot<ImageAsset> }) {
  const image = slotValue(slot);
  if (!image) return <PendingNotice label={slot.label} />;
  return (
    <figure>
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="(min-width: 1280px) 1216px, 100vw"
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading="lazy"
        className="mx-auto h-auto w-full rounded border border-line"
      />
      {image.caption && <figcaption className="mt-2 text-sm text-ink-muted">{image.caption}</figcaption>}
    </figure>
  );
}

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
export function HomeView({ home, about, site }: HomeViewProps) {
  const programName = slotValue(site.programName);
  const leadership = slotValue(home.leadershipSlides);
  const gallery = slotValue(home.gallery);
  const dean = slotValue(home.deanMessage);
  const chair = slotValue(home.programChairMessage);
  const aboutPhoto = slotValue(about.photo);

  const previews: Preview[] = [
    { id: 'mission-and-vision', title: 'Mission and Vision', slots: [about.mission, about.vision] },
    { id: 'goals-and-objectives', title: 'Goals and Objectives', slots: [about.goals, about.objectives] },
    { id: 'history', title: 'History', slots: [about.history] },
  ].filter((preview) => preview.slots.some(listRenders));

  const showLeadership = listRenders(home.leadershipSlides);
  const showSlide1 = singleRenders(home.accreditationSlide1);
  const showSlide2 = singleRenders(home.accreditationSlide2);
  const showGallery = listRenders(home.gallery);
  const showVideo = videoRenders(home.video);
  const showMessages = singleRenders(home.deanMessage) || singleRenders(home.programChairMessage);
  const showAbout = singleRenders(about.photo) || previews.length > 0;
  // In production with everything pending, none of these is true and the page says so instead of ending after the heading.
  const hasAnything =
    showLeadership || showSlide1 || showSlide2 || showGallery || showVideo || showMessages || showAbout;

  return (
    <>
      <div className="on-maroon bg-maroon-800 text-white">
        <div className={`${wrap} py-10 sm:py-12 lg:py-14`}>
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-serif text-3xl font-semibold leading-tight tracking-tight text-white outline-none sm:text-4xl lg:text-5xl"
          >
            {`${site.universityName} ${site.schoolName}`}
          </h1>
          {programName && <p className="mt-3 max-w-[60ch] text-lg text-white">{programName}</p>}
          <div aria-hidden="true" className="mt-5 h-[3px] w-16 bg-gold-500" />
          {showLeadership && (
            <div className="mt-8 sm:mt-10">
              {leadership && leadership.length > 0 ? (
                // The white panel keeps the slideshow dots visible, and on-light resets the gold focus ring (D9: gold on maroon only).
                <div className="on-light mx-auto max-w-4xl rounded bg-white p-3 sm:p-4">
                  <Slideshow label="Graduate School leadership" slides={leadership} />
                </div>
              ) : (
                <PendingNotice label={home.leadershipSlides.label} />
              )}
            </div>
          )}
        </div>
      </div>

      <QuickAccess areasLabel={site.areasLabel} />

      <div className="pb-12 sm:pb-16">
        {showSlide1 && (
          <Band>
            <SlideImage slot={home.accreditationSlide1} />
          </Band>
        )}

        <Band>
          <div className="text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-maroon-800 sm:text-3xl">
              {home.accreditationHeading}
            </h2>
            <div aria-hidden="true" className="mx-auto mt-4 h-[3px] w-16 bg-gold-500" />
          </div>
        </Band>

        {showSlide2 && (
          <Band>
            <SlideImage slot={home.accreditationSlide2} />
          </Band>
        )}

        {showGallery && (
          <Band>
            {gallery && gallery.length > 0 ? (
              <ImageGallery label="Graduate School gallery" images={gallery} />
            ) : (
              <PendingNotice label={home.gallery.label} />
            )}
          </Band>
        )}

        {showVideo && (
          <Band>
            <section aria-label={home.video.title} className="mx-auto max-w-4xl">
              <VideoEmbed resource={home.video} />
            </section>
          </Band>
        )}

        {showMessages && (
          <Band>
            <section aria-labelledby="messages-title" className="space-y-6">
              <SectionHeading level={2} id="messages-title">
                Messages
              </SectionHeading>
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                {dean ? <LeaderMessageCard message={dean} /> : <PendingNotice label={home.deanMessage.label} />}
                {chair ? (
                  <LeaderMessageCard message={chair} />
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
                <div className="grid gap-8 lg:grid-cols-3">
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
