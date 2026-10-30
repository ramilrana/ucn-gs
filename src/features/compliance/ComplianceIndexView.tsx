import { PendingNotice } from '../../components/content/PendingNotice';
import { Prose } from '../../components/content/Prose';
import { PageShell } from '../../components/layout/PageShell';
import { ActionLink } from '../../components/ui/ActionLink';
import { isSlotVisible, slotValue, visible } from '../../lib/published';
import type { Recommendation, Slot } from '../../types/content';

interface ComplianceIndexViewProps {
  overview: Slot<string[]>;
  recommendations: readonly Recommendation[];
}

const TITLE = 'Compliance Report';

/** The Compliance Report index: the overview when published, then one link per visible recommendation. */
export function ComplianceIndexView({ overview, recommendations }: ComplianceIndexViewProps) {
  const paragraphs = slotValue(overview) ?? [];
  const shown = visible(recommendations);
  const showOverview = paragraphs.length > 0 || isSlotVisible(overview);

  return (
    <PageShell title={TITLE} hasContent={paragraphs.length > 0 || shown.length > 0}>
      <div className="space-y-8">
        {showOverview && (paragraphs.length > 0 ? <Prose paragraphs={paragraphs} /> : <PendingNotice label={overview.label} />)}
        {shown.length > 0 && (
          <ol className="divide-y divide-line border-y border-line">
            {shown.map((rec) => (
              <li key={rec.number} className="py-3">
                <ActionLink href={`/compliance-report/recommendation-${rec.number}`}>
                  Recommendation {rec.number}: {rec.title}
                </ActionLink>
              </li>
            ))}
          </ol>
        )}
      </div>
    </PageShell>
  );
}
