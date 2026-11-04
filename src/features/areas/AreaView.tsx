import { PendingNotice } from '../../components/content/PendingNotice';
import { ResourceList } from '../../components/content/ResourceList';
import { EvidenceGroup } from '../../components/content/EvidenceGroup';
import { hasVisibleContent } from '../../components/content/visibility';
import { PageShell } from '../../components/layout/PageShell';
import { Pager, type PagerItem } from '../../components/layout/Pager';
import { DocumentViewer } from '../../components/media/DocumentViewer';
import { Slideshow } from '../../components/media/Slideshow';
import { ActionLink } from '../../components/ui/ActionLink';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { isVisible, showPending, slotValue, visible } from '../../lib/published';
import { viewUrl } from '../../lib/resourceUrls';
import type { Area } from '../../types/content';

interface AreaViewProps {
  area: Area;
  siblings: readonly PagerItem[];
}

/** One accreditation area: photos, narrative report, evidence, additional files and AVP link. */
export function AreaView({ area, siblings }: AreaViewProps) {
  const images = slotValue(area.gallery) ?? [];
  const showGallery = images.length > 0 || showPending();

  const narrative = area.narrativeReport;
  const narrativeSource = narrative.source;
  const showNarrative = isVisible(narrative) && (narrativeSource !== undefined || showPending());
  const narrativeHref = narrativeSource ? viewUrl(narrativeSource) : null;

  const extraFiles = visible(area.additionalFiles);
  const avp = area.avp !== undefined && isVisible(area.avp) ? area.avp : undefined;

  const hasContent =
    images.length > 0 || showNarrative || avp !== undefined || hasVisibleContent(area.groups, area.additionalFiles);

  return (
    <PageShell title={area.title} intro={area.summary} hasContent={hasContent}>
      <div className="space-y-12">
        {showGallery &&
          (images.length > 0 ? (
            <Slideshow label={`${area.title} photos`} slides={images} />
          ) : (
            <PendingNotice label={area.gallery.label} />
          ))}

        {showNarrative && (
          <section aria-labelledby="narrative-report" className="space-y-4">
            <SectionHeading level={2} id="narrative-report">
              Narrative Report
            </SectionHeading>
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

        {area.groups.map((group) => (
          <EvidenceGroup key={group.id} group={group} headingLevel={2} />
        ))}

        {extraFiles.length > 0 && (
          <section aria-labelledby="additional-files" className="space-y-4">
            <SectionHeading level={2} id="additional-files">
              Additional Files
            </SectionHeading>
            <ResourceList items={area.additionalFiles} label={`${area.title} additional files`} />
          </section>
        )}

        {avp && (
          <section aria-labelledby="area-avp" className="space-y-4">
            <SectionHeading level={2} id="area-avp">
              Audio Visual Presentation
            </SectionHeading>
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
