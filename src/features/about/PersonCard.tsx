import { User } from 'lucide-react';
import type { Person } from '../../types/content';

/** One person: photo (or a neutral silhouette, never a made-up photo), name with post-nominals, position, rank. */
export function PersonCard({ person }: { person: Person }) {
  const { photo } = person;
  const name = person.postNominals ? `${person.name}, ${person.postNominals}` : person.name;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded border border-line bg-white">
      {photo ? (
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[4/5] w-full items-center justify-center bg-paper">
          <User aria-hidden="true" strokeWidth={1} className="size-1/2 text-line" />
        </div>
      )}
      <div className="space-y-1 p-4">
        <p className="font-serif text-lg font-semibold leading-snug text-maroon-800">{name}</p>
        <p className="text-ink">{person.position}</p>
        {person.rank && <p className="text-sm text-ink-muted">{person.rank}</p>}
      </div>
    </div>
  );
}
