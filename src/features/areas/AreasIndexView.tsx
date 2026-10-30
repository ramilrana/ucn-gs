import { PageShell } from '../../components/layout/PageShell';
import { ActionLink } from '../../components/ui/ActionLink';
import { visible } from '../../lib/published';
import type { Area } from '../../types/content';

interface AreasIndexViewProps {
  areas: readonly Area[];
  /** The page title, from the site's areas label. */
  label: string;
}

/** The areas index: one card per visible area, in the order given. */
export function AreasIndexView({ areas, label }: AreasIndexViewProps) {
  const shown = visible(areas);
  return (
    <PageShell title={label} hasContent={shown.length > 0}>
      <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((area) => {
          const firstParagraph = area.summary?.[0];
          return (
            <li key={area.slug} className="flex flex-col gap-3 rounded border border-line bg-white p-5">
              <h2 className="font-serif text-xl font-semibold text-maroon-800">{area.title}</h2>
              {firstParagraph && <p className="max-w-[70ch] leading-relaxed text-ink">{firstParagraph}</p>}
              <p className="mt-auto pt-2">
                <ActionLink href={`/accreditation-areas/${area.slug}`} variant="secondary">
                  View {area.title}
                </ActionLink>
              </p>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
