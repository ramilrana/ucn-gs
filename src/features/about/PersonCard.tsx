import { User } from 'lucide-react';
import type { Person } from '../../types/content';

interface PersonCardProps {
  person: Person;
  /** `featured`: the larger President and Dean entries at the top of the people page. */
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
    <div className="flex h-full flex-col items-center text-center">
      {photo ? (
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={featured ? '16rem' : '11rem'}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          className={`${frame} object-contain`}
        />
      ) : (
        <div className={`${frame} flex items-center justify-center rounded-full bg-paper`}>
          <User aria-hidden="true" strokeWidth={1} className="size-1/2 text-line" />
        </div>
      )}
      <div className={featured ? 'mt-5 space-y-1.5' : 'mt-4 space-y-1'}>
        <p
          className={`font-serif font-semibold leading-snug text-maroon-800 ${featured ? 'text-2xl' : 'text-lg'}`}
        >
          {name}
        </p>
        <p className={`whitespace-pre-line text-ink ${featured ? 'text-lg' : ''}`}>{person.position}</p>
        {person.rank && <p className="text-sm text-ink-muted">{person.rank}</p>}
      </div>
    </div>
  );
}
