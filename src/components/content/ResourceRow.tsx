import { isVisible } from '../../lib/published';
import { downloadUrl, hostLabel, viewUrl } from '../../lib/resourceUrls';
import type { Resource } from '../../types/content';
import { ActionLink } from '../ui/ActionLink';
import { Badge } from '../ui/Badge';

/** One resource as a list item: format badge, linked title, description, host and optional download. */
export function ResourceRow({ resource }: { resource: Resource }) {
  if (!isVisible(resource)) return null;
  const source = resource.source;

  if (!source) {
    // Only reachable for pending resources, which isVisible lets through outside production.
    return (
      <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
        <Badge format={resource.format} />
        <span className="font-medium text-ink">{resource.title}</span>
        <span className="text-sm text-ink-muted">Pending: not yet supplied</span>
      </li>
    );
  }

  const openHref = viewUrl(source);
  const downloadHref = resource.downloadable ? downloadUrl(source) : null;
  // hostLabel is '' for mailto: and tel: links; treat that as absent.
  const host = hostLabel(source);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Badge format={resource.format} />
        <span className="font-medium">
          {openHref ? <ActionLink href={openHref}>{resource.title}</ActionLink> : <span className="text-ink">{resource.title}</span>}
        </span>
        {host !== '' && <span className="text-sm text-ink-muted">{host}</span>}
        {downloadHref && (
          <ActionLink href={downloadHref} download>
            Download
            <span className="sr-only"> {resource.title}</span>
          </ActionLink>
        )}
      </div>
      {resource.description && <p className="mt-1 max-w-[70ch] text-sm text-ink-muted">{resource.description}</p>}
    </li>
  );
}
