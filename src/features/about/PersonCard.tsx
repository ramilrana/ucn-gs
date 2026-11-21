import { User } from 'lucide-react';
import type { Person } from '../../types/content';

interface PersonCardProps {
  person: Person;
  /**
   * `featured`: the President and Dean at the top of the people page: a full-width row on a light band with a maroon
   * edge, the larger photo beside the name (above it on phones).
   */
  size?: 'default' | 'featured';
}

/**
 * One person: the round portrait on its own (UCN's photos are circles with a gold ring on a transparent square, so no
 * box or background is drawn around them; user's request 2026-11-21), then the name with post-nominals, the position
 * (a "\n" in it starts a new line) and the rank. Without a photo, a neutral round silhouette, never a made-up photo.
 */
export function PersonCard({ person, size = 'default' }: PersonCardProps) {
  const { photo } = person;
  const featured = size === 'featured';
  const name = person.postNominals ? `${person.name}, ${person.postNominals}` : person.name;
  const frame = featured ? 'size-56 sm:size-64' : 'size-44';
  return (
    <div
      className={
        featured
          ? 'flex h-full flex-col items-center gap-6 rounded border-l-4 border-maroon-800 bg-paper px-6 py-8 text-center sm:flex-row sm:gap-10 sm:px-10 sm:text-left'
          : 'flex h-full flex-col items-center text-center'
      }
    >
      {photo ? (
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={featured ? '16rem' : '11rem'}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          className={`${frame} shrink-0 object-contain`}
        />
      ) : (
        <div className={`${frame} flex items-center justify-center rounded-full bg-paper`}>
          <User aria-hidden="true" strokeWidth={1} className="size-1/2 text-line" />
        </div>
      )}
      <div className={featured ? 'space-y-2' : 'mt-4 space-y-1'}>
        <p
          className={`font-serif font-semibold leading-snug text-maroon-800 ${featured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}
        >
          {name}
        </p>
        <p className={`whitespace-pre-line text-ink ${featured ? 'text-lg' : ''}`}>{person.position}</p>
        {person.rank && <p className="text-sm text-ink-muted">{person.rank}</p>}
      </div>
    </div>
  );
}
