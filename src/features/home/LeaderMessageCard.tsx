import { User } from 'lucide-react';
import { Prose } from '../../components/content/Prose';
import type { ImageAsset, LeaderMessage } from '../../types/content';

/**
 * One leader's message as a "feature banner" (the user's pick of four previewed designs, 2026-11-20): a maroon header
 * with the portrait standing on its bottom edge and the name and position beside it, then the paragraphs on white.
 * Photos are cut-outs shown whole, as supplied, never cropped. Without a real photo it shows the dev/preview-only
 * `placeholderPhoto` if given, otherwise a silhouette (production never gets a placeholder).
 * From lg the message flows into two columns of about 70 characters a line, filling the card's width (the user's
 * pick of four previewed layouts, 2026-11-22); below lg it is one column.
 */
export function LeaderMessageCard({ message, placeholderPhoto }: { message: LeaderMessage; placeholderPhoto?: ImageAsset }) {
  const photo = message.photo ?? placeholderPhoto;
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
      <div className="on-maroon flex flex-col items-center gap-6 bg-linear-to-br from-maroon-800 to-maroon-900 px-6 pt-8 sm:flex-row sm:items-end sm:gap-10 sm:px-10">
        {/* Same height for everyone; the person stands on the bottom edge of the banner. */}
        <div className="relative flex h-[22rem] w-full max-w-80 shrink-0 items-end justify-center">
          {photo ? (
            <img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="20rem"
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              loading="lazy"
              className="relative h-full w-auto max-w-full object-contain object-bottom drop-shadow-2xl"
            />
          ) : (
            <div aria-hidden="true" className="flex h-full w-full items-center justify-center">
              <User strokeWidth={1} className="size-1/2 text-white/30" />
            </div>
          )}
        </div>
        <div className="w-full border-t-4 border-gold-500 pb-8 pt-4 sm:border-t-0 sm:border-l-4 sm:pl-6 sm:pt-0">
          <h3 className="font-serif text-2xl font-semibold text-white sm:text-3xl">{message.name}</h3>
          {/* Gold text only on maroon (D9). */}
          <p className="mt-1 text-lg text-gold-500">{message.position}</p>
        </div>
      </div>
      <div className="p-6 sm:p-10">
        <Prose paragraphs={message.paragraphs} columns />
      </div>
    </article>
  );
}
