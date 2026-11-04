import { EvidenceGroup } from '../../components/content/EvidenceGroup';
import { Prose } from '../../components/content/Prose';
import { ResourceList } from '../../components/content/ResourceList';
import { groupHasVisibleContent } from '../../components/content/visibility';
import { PageShell } from '../../components/layout/PageShell';
import { Pager, type PagerItem } from '../../components/layout/Pager';
import { DocumentViewer } from '../../components/media/DocumentViewer';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { isVisible, showPending, visible } from '../../lib/published';
import type { Recommendation } from '../../types/content';

interface RecommendationViewProps {
  rec: Recommendation;
  siblings: readonly PagerItem[];
}

/** One recommendation: statement, the recommendation document, numbered evidence and additional files. */
export function RecommendationView({ rec, siblings }: RecommendationViewProps) {
  const statement = rec.statement ?? [];
  const showDocument = isVisible(rec.document) && (rec.document.source !== undefined || showPending());
  // Numbered by visible position: hidden groups leave no gaps.
  const evidence = rec.evidence.filter(groupHasVisibleContent);
  const extraFiles = visible(rec.additionalFiles);

  const hasContent = statement.length > 0 || showDocument || evidence.length > 0 || extraFiles.length > 0;

  return (
    <PageShell title={`Recommendation ${rec.number}`} intro={[rec.title]} hasContent={hasContent}>
      <div className="space-y-12">
        {statement.length > 0 && <Prose paragraphs={statement} />}

        {showDocument && (
          <section aria-labelledby="recommendation-document" className="space-y-4">
            <SectionHeading level={2} id="recommendation-document">
              Recommendation document
            </SectionHeading>
            <DocumentViewer resource={rec.document} mode="embedded" />
          </section>
        )}

        {evidence.length > 0 && (
          <section aria-labelledby="evidence-of-compliance" className="space-y-8">
            <SectionHeading level={2} id="evidence-of-compliance">
              Evidence of Compliance
            </SectionHeading>
            {evidence.map((group, i) => (
              <EvidenceGroup key={group.id} group={group} headingLevel={3} index={i + 1} />
            ))}
          </section>
        )}

        {extraFiles.length > 0 && (
          <section aria-labelledby="additional-files" className="space-y-4">
            <SectionHeading level={2} id="additional-files">
              Additional Files
            </SectionHeading>
            <ResourceList items={rec.additionalFiles} label={`Recommendation ${rec.number} additional files`} />
          </section>
        )}

        <Pager items={siblings} currentPath={`/compliance-report/recommendation-${rec.number}`} />
      </div>
    </PageShell>
  );
}
