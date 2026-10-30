import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { isVisible } from '../../lib/published';
import { formatLabels } from '../../lib/resourceFormat';
import { downloadUrl, embedUrl, hostLabel, viewUrl } from '../../lib/resourceUrls';
import type { Resource } from '../../types/content';
import { PendingNotice } from '../content/PendingNotice';
import { ActionLink } from '../ui/ActionLink';
import { Badge } from '../ui/Badge';

interface DocumentViewerProps {
  resource: Resource;
  /** `embedded` loads the frame at once; `on-demand` mounts it only after Preview is pressed. */
  mode: 'embedded' | 'on-demand';
}

const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-presentation';

/** A document with an actions row and a sandboxed PDF frame (or a fallback card). */
export function DocumentViewer({ resource, mode }: DocumentViewerProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();

  if (!isVisible(resource)) return null;
  const source = resource.source;
  if (!source) return <PendingNotice label={resource.title} />;

  const frameSrc = embedUrl(source);
  const openHref = viewUrl(source);
  const downloadHref = resource.downloadable ? downloadUrl(source) : null;
  // Local files are never framed. Under the spec section 8 CSP a same-origin PDF frame is blocked three
  // ways: frame-src has no 'self', the PDF response carries frame-ancestors 'none', and Chrome disables
  // its PDF viewer in sandboxed frames. A card with Open and Download links replaces it (ruling R19).
  const localCard = source.kind === 'local';
  const canFrame = frameSrc !== null && !localCard;
  const showPanel = canFrame && (mode === 'embedded' || previewOpen);

  return (
    <div role="group" aria-labelledby={titleId} className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span id={titleId} className="font-semibold text-ink">{resource.title}</span>
        <Badge format={resource.format} />
        <span className="text-sm text-ink-muted">{hostLabel(source)}</span>
        {mode === 'on-demand' && canFrame && (
          <button
            type="button"
            aria-expanded={previewOpen}
            aria-controls={panelId}
            onClick={() => setPreviewOpen((v) => !v)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded border border-maroon-800 px-4 py-2 font-medium text-maroon-800 hover:bg-paper hover:text-maroon-900"
          >
            Preview {resource.title}
            <ChevronDown
              aria-hidden="true"
              className={`size-4 shrink-0 transition-transform duration-150 ${previewOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
        {!localCard && openHref && (
          <ActionLink href={openHref} newTab>
            Open in new tab
            <span className="sr-only"> {resource.title}</span>
          </ActionLink>
        )}
        {!localCard && downloadHref && (
          <ActionLink href={downloadHref} download>
            Download
            <span className="sr-only"> {resource.title}</span>
          </ActionLink>
        )}
      </div>
      {localCard && (
        <div className="rounded border border-line bg-paper p-4">
          <p className="text-ink">Open this file in a new tab or download it.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {openHref && (
              <ActionLink href={openHref} newTab variant="primary">
                Open file
                <span className="sr-only"> {resource.title}</span>
              </ActionLink>
            )}
            {downloadHref && (
              <ActionLink href={downloadHref} download variant="secondary">
                Download
                <span className="sr-only"> {resource.title}</span>
              </ActionLink>
            )}
          </div>
        </div>
      )}
      {!localCard && (
        <div id={panelId}>
          {showPanel && (
            <iframe
              title={`${resource.title} (${formatLabels[resource.format]})`}
              src={frameSrc}
              loading="lazy"
              sandbox={SANDBOX}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="fullscreen"
              className="w-full h-[min(85vh,960px)] min-h-[480px]"
            />
          )}
        </div>
      )}
    </div>
  );
}
