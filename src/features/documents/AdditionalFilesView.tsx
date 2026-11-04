import { ResourceList } from '../../components/content/ResourceList';
import { PageShell } from '../../components/layout/PageShell';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { visible } from '../../lib/published';
import type { ResourceGroup } from '../../types/content';

interface AdditionalFilesViewProps {
  groups: readonly ResourceGroup[];
}

const TITLE = 'Additional Files for the Accreditors';

/** Resource groups, each under its own h2 (left out when the page has only one group). */
export function AdditionalFilesView({ groups }: AdditionalFilesViewProps) {
  const shown = visible(groups).filter((group) => visible(group.items).length > 0);
  const showHeadings = shown.length > 1;

  return (
    <PageShell title={TITLE} hasContent={shown.length > 0}>
      <div className="space-y-10">
        {shown.map((group) => (
          <div key={group.id} className="space-y-4">
            {showHeadings && (
              <SectionHeading level={2} id={`group-${group.id}`}>
                {group.title}
              </SectionHeading>
            )}
            <ResourceList items={group.items} label={group.title} />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
