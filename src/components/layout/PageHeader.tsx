import { Prose } from '../content/Prose';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  intro?: readonly string[];
  /** Flow the intro into two columns from lg (About, 2026-11-22). */
  introColumns?: boolean;
  /** Show the title in a maroon banner (area pages, 2026-11-22) instead of the plain white header. */
  banner?: PageBanner;
}

export interface PageBanner {
  /** Small gold line above the title, e.g. "Area I". */
  eyebrow?: string;
}

/** The white band at the top of every inner page: breadcrumbs, the serif h1, a short gold rule, an optional intro. */
export function PageHeader({ title, intro, introColumns = false, banner }: PageHeaderProps) {
  useDocumentTitle(title);
  if (banner) return <BannerHeader title={title} intro={intro} banner={banner} />;
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

/**
 * Breadcrumbs on white, then a centred maroon banner: gold eyebrow, white serif title, gold rule, with faint gold rings in
 * opposite corners (the user's pick of three previewed layouts, 2026-11-22). Gold only on maroon (D9).
 */
function BannerHeader({ title, intro, banner }: { title: string; intro?: readonly string[]; banner: PageBanner }) {
  const { eyebrow } = banner;
  return (
    <div>
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <Breadcrumbs />
        </div>
      </div>
      <div className="on-maroon relative isolate overflow-hidden bg-linear-to-br from-maroon-800 to-maroon-900 text-white">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 -z-10 size-96 rounded-full border-[40px] border-gold-500/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-24 -z-10 size-80 rounded-full border-[36px] border-gold-500/10"
        />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-14 lg:py-16">
          {eyebrow && (
            <p className="reveal text-sm font-semibold uppercase tracking-[0.25em] text-gold-500 sm:text-base">{eyebrow}</p>
          )}
          <h1
            id="page-title"
            tabIndex={-1}
            className="reveal mt-3 break-words font-serif text-4xl font-semibold leading-tight tracking-tight text-white outline-none [--d:1] sm:text-5xl lg:text-6xl"
          >
            {title}
          </h1>
          <div aria-hidden="true" className="reveal-rule mx-auto mt-5 h-[3px] w-20 bg-gold-500 [--d:1]" />
          {intro && intro.length > 0 && (
            <div className="reveal mx-auto mt-5 max-w-[70ch] space-y-3 text-white [--d:2]">
              {intro.map((text, i) => (
                <p key={i} className="leading-relaxed">
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
