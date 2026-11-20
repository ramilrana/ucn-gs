import { User } from 'lucide-react';
import { Prose } from '../../components/content/Prose';
import type { ImageAsset, LeaderMessage } from '../../types/content';

/**
 * One leader's message: the photo, the name and position, then the paragraphs. Without a real photo it shows the
 * dev/preview-only `placeholderPhoto` if given, otherwise a silhouette (production never gets a placeholder).
 */
export function LeaderMessageCard({ message, placeholderPhoto }: { message: LeaderMessage; placeholderPhoto?: ImageAsset }) {
  const photo = message.photo ?? placeholderPhoto;
  return (
    <article className="grid grid-cols-1 gap-6 rounded border border-line bg-white p-5 sm:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)] sm:p-6">
      {photo ? (
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          // Every photo gets the same 4:5 frame and is shown whole inside it (never cropped, user's request
          // 2026-11-20), standing on the bottom edge. The cut-outs are transparent, so the paper backdrop is
          // the same behind all of them.
          className="aspect-[4/5] w-full max-w-72 rounded bg-paper object-contain object-bottom"
        />
      ) : (
        <div aria-hidden="true" className="flex aspect-[4/5] w-full max-w-72 items-center justify-center rounded bg-paper">
          <User strokeWidth={1} className="size-1/2 text-line" />
        </div>
      )}
      <div className="min-w-0 space-y-4">
        <div>
          <h3 className="font-serif text-xl font-semibold text-maroon-800">{message.name}</h3>
          <p className="text-ink-muted">{message.position}</p>
        </div>
        <Prose paragraphs={message.paragraphs} />
      </div>
    </article>
  );
}
