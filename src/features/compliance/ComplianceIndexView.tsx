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

const headingId = (slug: string) => `${slug}-recommendations-title`;

/**
 * The Compliance Report index: the overview when published, then one section per visible area that has
 * visible recommendations. Each section's id is the area slug, so `/compliance-report#<slug>` lands on it.
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
  useFocusHashTarget(
    hash,
    groups.map(({ area }) => area.slug),
    key,
  );

  return (
    <PageShell title={TITLE} hasContent={paragraphs.length > 0 || groups.length > 0}>
      <div className="space-y-10">
        {showOverview &&
          (paragraphs.length > 0 ? <Prose paragraphs={paragraphs} /> : <PendingNotice label={overview.label} />)}
        {groups.map(({ area, recs }) => (
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
