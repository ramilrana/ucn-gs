import { PendingNotice } from '../../components/content/PendingNotice';
import { ResourceList } from '../../components/content/ResourceList';
import { EvidenceGroup } from '../../components/content/EvidenceGroup';
import { hasVisibleContent } from '../../components/content/visibility';
import { PageShell } from '../../components/layout/PageShell';
import { Pager, type PagerItem } from '../../components/layout/Pager';
import { DocumentViewer } from '../../components/media/DocumentViewer';
import { HeroCarousel } from '../../components/media/HeroCarousel';
import { ActionLink } from '../../components/ui/ActionLink';
import { BandHeading } from '../../components/ui/BandHeading';
import { areaEyebrow } from '../../lib/areaLabel';
import { isVisible, showPending, slotValue, visible } from '../../lib/published';
import { viewUrl } from '../../lib/resourceUrls';
import type { Area } from '../../types/content';

interface AreaViewProps {
  area: Area;
  siblings: readonly PagerItem[];
}

/**
 * One accreditation area: a maroon banner ("Area I" and the title; no photo or program line, user's request), then the narrative report, the
 * auto-advancing photo carousel, the Working Checklist (2026-11-26), evidence, additional files and the AVP link (order and banner: user's
 * request 2026-11-22).
 */
export function AreaView({ area, siblings }: AreaViewProps) {
  const images = slotValue(area.gallery) ?? [];
  const showGallery = images.length > 0 || showPending();

  const narrative = area.narrativeReport;
  const narrativeSource = narrative.source;
  const showNarrative = isVisible(narrative) && (narrativeSource !== undefined || showPending());
  const narrativeHref = narrativeSource ? viewUrl(narrativeSource) : null;

  const checklist = area.workingChecklist;
  const showChecklist =
    checklist !== undefined && isVisible(checklist) && (checklist.source !== undefined || showPending());

  const extraFiles = visible(area.additionalFiles);
  const avp = area.avp !== undefined && isVisible(area.avp) ? area.avp : undefined;

  const hasContent =
    images.length > 0 ||
    showNarrative ||
    showChecklist ||
    avp !== undefined ||
    hasVisibleContent(area.groups, area.additionalFiles);

  return (
    <PageShell
      title={area.title}
      intro={area.summary}
      hasContent={hasContent}
      banner={{ eyebrow: areaEyebrow(area.order) }}
    >
      {/* Roomier than other pages (user's request 2026-11-22): 64–80px between sections. */}
      <div className="space-y-16 pt-2 lg:space-y-20">
        {showNarrative && (
          <section aria-labelledby="narrative-report" className="space-y-6">
            <BandHeading id="narrative-report">Narrative Report</BandHeading>
            {narrativeHref && (
              <p>
                <ActionLink href={narrativeHref} variant="primary" newTab>
                  Open the {area.title} narrative report
                </ActionLink>
              </p>
            )}
            <DocumentViewer resource={narrative} mode="embedded" />
          </section>
        )}

        {showGallery &&
          (images.length > 0 ? (
            // Same auto-advancing peek carousel as Home (user's request 2026-11-22, a further D8 exception), with
            // Pause/Play, focus and hover pause and reduced-motion start-paused.
            <div className="overflow-hidden rounded-lg">
              <HeroCarousel label={`${area.title} photos`} slides={images} slideMaxWidth={800} />
            </div>
          ) : (
            <PendingNotice label={area.gallery.label} />
          ))}

        {/* Right below the photo carousel (user's request 2026-11-26); shown like the recommendations' links. */}
        {showChecklist && checklist && (
          <section aria-labelledby="working-checklist" className="space-y-6">
            <BandHeading id="working-checklist">Working Checklist</BandHeading>
            <DocumentViewer resource={checklist} mode="embedded" />
          </section>
        )}

        {area.groups.map((group) => (
          <EvidenceGroup key={group.id} group={group} headingLevel={2} band />
        ))}

        {extraFiles.length > 0 && (
          <section aria-labelledby="additional-files" className="space-y-6">
            <BandHeading id="additional-files">Additional Files</BandHeading>
            <ResourceList items={area.additionalFiles} label={`${area.title} additional files`} />
          </section>
        )}

        {avp && (
          <section aria-labelledby="area-avp" className="space-y-6">
            <BandHeading id="area-avp">Audio Visual Presentation</BandHeading>
            <p>
              <ActionLink href={`/avp#${area.slug}`}>View the {area.title} audio visual presentation</ActionLink>
            </p>
          </section>
        )}

        <Pager items={siblings} currentPath={`/accreditation-areas/${area.slug}`} />
      </div>
    </PageShell>
  );
}
