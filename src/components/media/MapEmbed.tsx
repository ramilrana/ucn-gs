import { slotValue } from '../../lib/published';
import { mapEmbedUrl, mapLinkUrl } from '../../lib/resourceUrls';
import type { Slot } from '../../types/content';
import { PendingNotice } from '../content/PendingNotice';
import { ActionLink } from '../ui/ActionLink';

interface MapEmbedProps {
  query: Slot<string>;
  address?: string;
}

const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-presentation';

/** Keyless Google map frame plus a plain link, for when the frame is blocked or fails. */
export function MapEmbed({ query, address }: MapEmbedProps) {
  const value = slotValue(query)?.trim();
  if (!value) return <PendingNotice label={query.label} />;

  return (
    <div className="space-y-3">
      <iframe
        title={`Map of ${address ?? value}`}
        src={mapEmbedUrl(value)}
        loading="lazy"
        sandbox={SANDBOX}
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-80 w-full rounded border border-line"
      />
      <ActionLink href={mapLinkUrl(value)} newTab>
        Open in Google Maps
      </ActionLink>
    </div>
  );
}
