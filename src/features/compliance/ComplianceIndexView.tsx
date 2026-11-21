import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PendingNotice } from '../../components/content/PendingNotice';
import { Prose } from '../../components/content/Prose';
import { PageShell } from '../../components/layout/PageShell';
import { ActionLink } from '../../components/ui/ActionLink';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { recommendationPath } from '../../content/routes';
import { isSlotVisible, isVisible, slotValue, visible } from '../../lib/published';
import { useFocusHashTarget } from '../../lib/useFocusHashTarget';
import type { Area, Recommendation, Slot } from '../../types/content';

interface ComplianceIndexViewProps {
  overview: Slot<string[]>;
  areas: readonly Area[];
  recommendations: readonly Recommendation[];
}

const TITLE = 'Compliance Report';
const COMPLIANCE_PATH = '/compliance-report';

const headingId = (slug: string) => `${slug}-recommendations-title`;

/** The area slug the URL hash names, if it is one of `slugs`; a malformed hash such as "#%" names none. */
function selectedSlug(hash: string, slugs: readonly string[]): string | undefined {
  if (hash.length < 2) return undefined;
  try {
    const id = decodeURIComponent(hash.slice(1));
    return slugs.includes(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The Compliance Report index. Without a hash (the "Compliance Report" menu item) it shows the overview when
 * published, then one section per visible area that has visible recommendations. With `#<area-slug>` (an area
 * under that menu, user's request 2026-11-20) it shows only that area's section and a link back to all areas.
 */
export function ComplianceIndexView({ overview, areas, recommendations }: ComplianceIndexViewProps) {
  const { hash, key } = useLocation();
  const paragraphs = slotValue(overview) ?? [];
  const showOverview = paragraphs.length > 0 || isSlotVisible(overview);
  const groups = [...areas]
    .sort((a, b) => a.order - b.order)
    .filter(isVisible)
    .map((area) => ({
      area,
      recs: visible(recommendations.filter((rec) => rec.areaSlug === area.slug)),
    }))
    .filter(({ recs }) => recs.length > 0);
  const selected = selectedSlug(
    hash,
    groups.map(({ area }) => area.slug),
  );
  const shown = selected === undefined ? groups : groups.filter(({ area }) => area.slug === selected);
  // Leaving an area for the full list keeps the pathname, so RootLayout does not move focus; the link that had it is
  // gone, so put focus on the page h1 instead of letting it fall to <body>.
  const wasFiltered = useRef(selected !== undefined);
  useEffect(() => {
    if (wasFiltered.current && selected === undefined) document.getElementById('page-title')?.focus();
    wasFiltered.current = selected !== undefined;
  }, [selected]);
  // A hash that names an area shows that area alone, right under the page title, so focus its heading but keep the
  // title and the "every area" link in view.
  useFocusHashTarget(
    hash,
    groups.map(({ area }) => area.slug),
    key,
    'page-top',
  );

  return (
    <PageShell title={TITLE} hasContent={paragraphs.length > 0 || groups.length > 0}>
      <div className="space-y-10">
        {selected === undefined
          ? showOverview &&
            (paragraphs.length > 0 ? <Prose paragraphs={paragraphs} /> : <PendingNotice label={overview.label} />)
          : groups.length > 1 && <ActionLink href={COMPLIANCE_PATH}>Show the recommendations of every area</ActionLink>}
        {shown.map(({ area, recs }) => (
          <section
            key={area.slug}
            id={area.slug}
            aria-labelledby={headingId(area.slug)}
            className="space-y-3"
          >
            <SectionHeading level={2} id={headingId(area.slug)} tabIndex={-1} className="scroll-mt-6">
              {area.title}
            </SectionHeading>
            <ol className="divide-y divide-line border-y border-line">
              {recs.map((rec) => (
                <li key={recommendationPath(area.slug, rec.number)} className="py-3">
                  <ActionLink href={recommendationPath(area.slug, rec.number)}>
                    {/* One wrapper keeps the text inline: ActionLink is a flex box that would drop the space before the hidden suffix.
                        The visible text starts the accessible name (SC 2.5.3); the hidden area name tells the areas apart. */}
                    <span>
                      Recommendation {rec.number}: {rec.title}{' '}
                      <span className="sr-only">({area.title})</span>
                    </span>
                  </ActionLink>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
