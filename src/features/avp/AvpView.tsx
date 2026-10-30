import { useLocation } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { VideoEmbed } from '../../components/media/VideoEmbed';
import { ActionLink } from '../../components/ui/ActionLink';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { isVisible } from '../../lib/published';
import { useFocusHashTarget } from '../../lib/useFocusHashTarget';
import type { Area } from '../../types/content';

interface AvpViewProps {
  areas: readonly Area[];
}

const TITLE = 'Audio Visual Presentations';

const headingId = (slug: string) => `${slug}-avp-title`;

/** Audio visual presentations, one section per area, each reachable by its area slug. */
export function AvpView({ areas }: AvpViewProps) {
  const { hash } = useLocation();
  const entries = areas.flatMap((area) =>
    isVisible(area) && area.avp !== undefined && isVisible(area.avp) ? [{ area, avp: area.avp }] : [],
  );
  useFocusHashTarget(
    hash,
    entries.map(({ area }) => area.slug),
  );

  return (
    <PageShell title={TITLE} hasContent={entries.length > 0}>
      <div className="space-y-12">
        {entries.map(({ area, avp }) => (
          <section key={area.slug} id={area.slug} aria-labelledby={headingId(area.slug)} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-ink-muted">Area: {area.title}</p>
              <SectionHeading level={2} id={headingId(area.slug)} tabIndex={-1}>
                {avp.avpTitle ?? area.title}
              </SectionHeading>
            </div>
            <VideoEmbed resource={avp} />
            <p>
              <ActionLink href={`/accreditation-areas/${area.slug}`}>Go to {area.title}</ActionLink>
            </p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
