import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { VideoEmbed } from '../../components/media/VideoEmbed';
import { ActionLink } from '../../components/ui/ActionLink';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { isVisible } from '../../lib/published';
import type { Area } from '../../types/content';

interface AvpViewProps {
  areas: readonly Area[];
}

const TITLE = 'Audio Visual Presentations';

const headingId = (slug: string) => `${slug}-avp-title`;

/**
 * Moves focus to the h2 named by the URL hash. It waits one task so it runs after RootLayout's
 * own focus on the page h1: that focus is set in a layout effect that follows this component's
 * effect (children first), or in a MutationObserver callback when the page loads lazily.
 * Either way a timer queued from here fires later, so the hash target wins.
 */
function useFocusHashTarget(hash: string, entryCount: number): void {
  useEffect(() => {
    if (hash.length < 2) return;
    const slug = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => {
      const heading = document.getElementById(slug)?.querySelector('h2');
      if (!heading) return;
      heading.focus({ preventScroll: true });
      if (typeof heading.scrollIntoView === 'function') {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        heading.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hash, entryCount]);
}

/** Audio visual presentations, one section per area, each reachable by its area slug. */
export function AvpView({ areas }: AvpViewProps) {
  const { hash } = useLocation();
  const entries = areas.flatMap((area) =>
    isVisible(area) && area.avp !== undefined && isVisible(area.avp) ? [{ area, avp: area.avp }] : [],
  );
  useFocusHashTarget(hash, entries.length);

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
