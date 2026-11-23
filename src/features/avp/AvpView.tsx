import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { VideoEmbed } from '../../components/media/VideoEmbed';
import { ActionLink } from '../../components/ui/ActionLink';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { hashSlug } from '../../lib/hashSlug';
import { isVisible } from '../../lib/published';
import { useFocusHashTarget } from '../../lib/useFocusHashTarget';
import type { Area } from '../../types/content';

interface AvpViewProps {
  areas: readonly Area[];
}

const TITLE = 'Audio Visual Presentations';
const AVP_PATH = '/avp';

const headingId = (slug: string) => `${slug}-avp-title`;

/**
 * Audio visual presentations, one section per area. Without a hash (the "AVP" menu item) every area's AVP shows; with
 * `#<area-slug>` (an area under that menu) only that area's AVP shows, with a link back to every area (user's request
 * 2026-11-23, the same pattern as the Compliance Report areas).
 */
export function AvpView({ areas }: AvpViewProps) {
  const { hash, key } = useLocation();
  const entries = areas.flatMap((area) =>
    isVisible(area) && area.avp !== undefined && isVisible(area.avp) ? [{ area, avp: area.avp }] : [],
  );
  const slugs = entries.map(({ area }) => area.slug);
  const selected = hashSlug(hash, slugs);
  const shown = selected === undefined ? entries : entries.filter(({ area }) => area.slug === selected);
  // Leaving an area for the full list keeps the pathname, so RootLayout does not move focus; the link that had it is
  // gone, so put focus on the page h1 instead of letting it fall to <body>.
  const wasFiltered = useRef(selected !== undefined);
  useEffect(() => {
    if (wasFiltered.current && selected === undefined) document.getElementById('page-title')?.focus();
    wasFiltered.current = selected !== undefined;
  }, [selected]);
  // The named area shows alone under the page title: focus its heading but keep the title and the back link in view.
  useFocusHashTarget(hash, slugs, key, 'page-top');

  return (
    <PageShell title={TITLE} hasContent={entries.length > 0}>
      <div className="space-y-12">
        {selected !== undefined && entries.length > 1 && (
          <p>
            <ActionLink href={AVP_PATH}>Show the audio visual presentations of every area</ActionLink>
          </p>
        )}
        {shown.map(({ area, avp }) => (
          <section key={area.slug} id={area.slug} aria-labelledby={headingId(area.slug)} className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-ink-muted">Area: {area.title}</p>
              <SectionHeading level={2} id={headingId(area.slug)} tabIndex={-1} className="scroll-mt-6">
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
