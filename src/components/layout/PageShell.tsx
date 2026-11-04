import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';

interface PageShellProps {
  title: string;
  intro?: readonly string[];
  /** False while a page has nothing to show yet: the page then shows a plain "being prepared" note. */
  hasContent: boolean;
  children?: ReactNode;
}

export function PageShell({ title, intro, hasContent, children }: PageShellProps) {
  return (
    <>
      <PageHeader title={title} intro={intro} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        {hasContent ? children : <p className="max-w-[70ch] text-ink-muted">Materials for this page are being prepared.</p>}
      </div>
    </>
  );
}
