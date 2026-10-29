import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { safeHref } from '../../lib/safeUrl';

export interface ActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: 'link' | 'primary' | 'secondary';
  download?: boolean;
  newTab?: boolean;
}

const base =
  'inline-flex items-center gap-1.5 rounded font-medium transition-colors duration-150';
const variants = {
  link: 'text-maroon-800 underline underline-offset-2 hover:text-maroon-900 [.on-maroon_&]:text-white [.on-maroon_&]:hover:text-white',
  primary: 'min-h-11 bg-maroon-800 px-4 py-2 text-white hover:bg-maroon-900',
  secondary:
    'min-h-11 border border-maroon-800 px-4 py-2 text-maroon-800 hover:bg-paper hover:text-maroon-900',
} as const;

/**
 * A link that is safe by construction. The href goes through safeHref; a rejected
 * URL renders as plain text. It never adds the site base path: root-relative hrefs
 * go to the router (which applies its basename), and callers pass localFileUrl()
 * output, which already includes the base, for downloads.
 */
export function ActionLink({ href, children, variant = 'link', download = false, newTab }: ActionLinkProps) {
  const safe = safeHref(href);
  if (safe === null) return <span>{children}</span>;

  const isExternal = safe.startsWith('https:');
  const opensNewTab = newTab ?? (isExternal && !download);
  const className = `${base} ${variants[variant]}`;
  const content = (
    <>
      {children}
      {opensNewTab && (
        <>
          <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only"> (opens in new tab)</span>
        </>
      )}
    </>
  );
  const newTabProps = opensNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  if (safe.startsWith('/') && !download) {
    return (
      <Link to={safe} className={className} {...newTabProps}>
        {content}
      </Link>
    );
  }
  return (
    <a href={safe} className={className} download={download ? '' : undefined} {...newTabProps}>
      {content}
    </a>
  );
}
