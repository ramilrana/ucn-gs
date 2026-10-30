import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { localFileUrl } from '../../lib/resourceUrls';
import { safeHref } from '../../lib/safeUrl';

export interface ActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: 'link' | 'primary' | 'secondary';
  download?: boolean;
  newTab?: boolean;
}

const base =
  'inline-flex items-center gap-1.5 rounded font-medium transition-[color,background-color,border-color] duration-150';
const variants = {
  link: 'text-maroon-800 underline underline-offset-2 hover:text-maroon-900 on-maroon:text-white on-maroon:hover:text-white',
  primary: 'min-h-11 bg-maroon-800 px-4 py-2 text-white hover:bg-maroon-900',
  secondary:
    'min-h-11 border border-maroon-800 px-4 py-2 text-maroon-800 hover:bg-paper hover:text-maroon-900',
} as const;

/** True when a root-relative href points at a file: its pathname's last segment contains a dot. */
function hasFileExtension(href: string): boolean {
  const pathname = href.split(/[?#]/, 1)[0] ?? '';
  return (pathname.split('/').pop() ?? '').includes('.');
}

/**
 * A link that is safe by construction. The href goes through safeHref; a rejected
 * URL renders as plain text. It never adds the site base path. Root-relative app
 * routes go to the router (which applies its basename). File URLs, which start with
 * the site base plus `files/` (what localFileUrl, viewUrl and downloadUrl return for
 * local sources), are plain anchors: they already include the base and are not routes,
 * so a router Link would double the base or land on the 404 route. So are root-relative
 * paths whose last segment has a file extension (a dot, ignoring `?query` and `#hash`),
 * such as the bundled dev sample PDF under `assets/`. App routes never contain dots.
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

  const isFileUrl = safe.startsWith(localFileUrl('/files/')) || hasFileExtension(safe);
  if (safe.startsWith('/') && !download && !isFileUrl) {
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
