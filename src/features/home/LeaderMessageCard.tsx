import { User } from 'lucide-react';
import { Prose } from '../../components/content/Prose';
import type { LeaderMessage } from '../../types/content';

/** One leader's message: the photo (never a made-up one), the name and position, then the paragraphs. */
export function LeaderMessageCard({ message }: { message: LeaderMessage }) {
  const { photo } = message;
  return (
    <article className="grid gap-6 rounded border border-line bg-white p-5 sm:grid-cols-[12rem_1fr] sm:p-6">
      {photo ? (
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          className="aspect-[4/5] w-full max-w-48 rounded object-cover"
        />
      ) : (
        <div aria-hidden="true" className="flex aspect-[4/5] w-full max-w-48 items-center justify-center rounded bg-paper">
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
