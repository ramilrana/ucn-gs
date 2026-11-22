import { Prose } from '../content/Prose';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  intro?: readonly string[];
  /** Flow the intro into two columns from lg (About, 2026-11-22). */
  introColumns?: boolean;
}

/** The white band at the top of every inner page: breadcrumbs, the serif h1, a short gold rule, an optional intro. */
export function PageHeader({ title, intro, introColumns = false }: PageHeaderProps) {
  useDocumentTitle(title);
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <Breadcrumbs />
        <h1
          id="page-title"
          tabIndex={-1}
          className="reveal mt-4 break-words font-serif text-3xl font-semibold leading-tight tracking-tight text-maroon-800 outline-none sm:text-4xl lg:text-5xl"
        >
          {title}
        </h1>
        <div aria-hidden="true" className="reveal-rule mt-5 h-[3px] w-16 bg-gold-500" />
        {intro && intro.length > 0 && (
          <div className="reveal mt-6 [--d:1]">
            <Prose paragraphs={intro} columns={introColumns} />
          </div>
        )}
      </div>
    </div>
  );
}
