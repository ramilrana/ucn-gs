import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { isVisible } from '../../lib/published';
import { embedUrl, hostLabel, isYouTubeId, viewUrl, youtubePosterUrl } from '../../lib/resourceUrls';
import type { ImageAsset, Resource } from '../../types/content';
import { PendingNotice } from '../content/PendingNotice';
import { ActionLink } from '../ui/ActionLink';

interface VideoEmbedProps {
  resource: Resource;
  poster?: ImageAsset;
}

const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-presentation';

/** Click-to-load video: a poster button first, the player frame only after it is pressed. */
export function VideoEmbed({ resource, poster }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The play button unmounts when pressed; hand focus to the new frame.
  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  if (!isVisible(resource)) return null;
  const source = resource.source;
  if (!source) return <PendingNotice label={resource.title} />;

  const openHref = viewUrl(source);

  // Facebook and other external videos are never framed.
  if (source.kind === 'external') {
    return openHref ? (
      <ActionLink href={openHref} variant="primary" newTab>
        Watch on {hostLabel(source)}
      </ActionLink>
    ) : (
      <span>{resource.title}</span>
    );
  }

  const frameBase = embedUrl(source);
  const isYouTube = source.kind === 'youtube';
  const frameSrc = frameBase === null ? null : frameBase + (isYouTube ? '?autoplay=1' : '');
  // youtubePosterUrl does not validate its id, so gate it here.
  const posterSrc =
    poster?.src ?? (source.kind === 'youtube' && isYouTubeId(source.videoId) ? youtubePosterUrl(source.videoId) : null);

  return (
    <div className="space-y-3">
      {frameSrc !== null &&
        (playing ? (
          <iframe
            ref={frameRef}
            title={resource.title}
            src={frameSrc}
            sandbox={SANDBOX}
            allow="fullscreen; encrypted-media; picture-in-picture; autoplay"
            referrerPolicy="strict-origin-when-cross-origin"
            className="aspect-video w-full"
          />
        ) : (
          <button
            type="button"
            aria-label={`Play video: ${resource.title}`}
            onClick={() => setPlaying(true)}
            className={`relative flex aspect-video min-h-11 w-full items-center justify-center overflow-hidden rounded bg-maroon-800 outline-offset-2 ${
              posterSrc ? '' : 'on-maroon'
            }`}
          >
            {posterSrc && (
              <img
                src={posterSrc}
                srcSet={poster?.srcSet}
                alt=""
                width={poster?.width}
                height={poster?.height}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-maroon-800 text-white">
              <Play aria-hidden="true" className="size-8" />
            </span>
          </button>
        ))}
      {openHref && (
        <ActionLink href={openHref} newTab>
          Open video in new tab
        </ActionLink>
      )}
    </div>
  );
}
