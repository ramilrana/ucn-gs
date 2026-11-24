import { EvidenceGroup } from '../../components/content/EvidenceGroup';
import { Prose } from '../../components/content/Prose';
import { ResourceList } from '../../components/content/ResourceList';
import { groupHasVisibleContent } from '../../components/content/visibility';
import { PageShell } from '../../components/layout/PageShell';
import { Pager, type PagerItem } from '../../components/layout/Pager';
import { DocumentViewer } from '../../components/media/DocumentViewer';
import { BandHeading } from '../../components/ui/BandHeading';
import { hasPlaceholderTitle } from '../../lib/placeholderTitle';
import { isVisible, showPending, visible } from '../../lib/published';
import type { Recommendation } from '../../types/content';

interface RecommendationViewProps {
  rec: Recommendation;
  /** Page title from the route entry, for example "Community Service: Recommendation 3". */
  title: string;
  /** Route path of this page, from the route entry. */
  path: string;
  siblings: readonly PagerItem[];
  /** Gold line above the title in the banner, e.g. "Area I" (from the area order). */
  eyebrow?: string;
}

/**
 * One recommendation: the area banner (as on area pages, user's request 2026-11-22), statement, the recommendation
 * document or link, numbered evidence and additional files, under maroon band titles.
 */
export function RecommendationView({ rec, title, path, siblings, eyebrow }: RecommendationViewProps) {
  const statement = rec.statement ?? [];
  const showDocument = isVisible(rec.document) && (rec.document.source !== undefined || showPending());
  // Numbered by visible position: hidden groups leave no gaps.
  const evidence = rec.evidence.filter(groupHasVisibleContent);
  const extraFiles = visible(rec.additionalFiles);

  // The placeholder title "Recommendation N" only repeats the banner title, so it is not shown as an intro.
  const intro = hasPlaceholderTitle(rec) ? undefined : [rec.title];
  const documentHeading = rec.document.format === 'link' ? 'Recommendation Link' : 'Recommendation document';

  const hasContent = statement.length > 0 || showDocument || evidence.length > 0 || extraFiles.length > 0;

  return (
    <PageShell title={title} intro={intro} hasContent={hasContent} banner={{ eyebrow }}>
      <div className="space-y-16 pt-2 lg:space-y-20">
        {statement.length > 0 && <Prose paragraphs={statement} />}

        {showDocument && (
          <section aria-labelledby="recommendation-document" className="space-y-6">
            <BandHeading id="recommendation-document">{documentHeading}</BandHeading>
            <DocumentViewer resource={rec.document} mode="embedded" />
          </section>
        )}

        {evidence.length > 0 && (
          <section aria-labelledby="evidence-of-compliance" className="space-y-10">
            <BandHeading id="evidence-of-compliance">Evidence of Compliance</BandHeading>
            {evidence.map((group, i) => (
              <EvidenceGroup key={group.id} group={group} headingLevel={3} index={i + 1} />
            ))}
          </section>
        )}

        {extraFiles.length > 0 && (
          <section aria-labelledby="additional-files" className="space-y-6">
            <BandHeading id="additional-files">Additional Files</BandHeading>
            <ResourceList items={rec.additionalFiles} label={`${title} additional files`} />
          </section>
        )}

        <Pager items={siblings} currentPath={path} />
      </div>
    </PageShell>
  );
}
