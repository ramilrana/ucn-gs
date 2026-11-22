import { useId } from 'react';
import type { EvidenceGroup as EvidenceGroupData } from '../../types/content';
import { BandHeading } from '../ui/BandHeading';
import { SectionHeading } from '../ui/SectionHeading';
import { BlockRenderer } from './BlockRenderer';
import { PendingNotice } from './PendingNotice';
import { groupHasVisibleContent } from './visibility';

interface EvidenceGroupProps {
  group: EvidenceGroupData;
  headingLevel: 2 | 3;
  index?: number;
  /** Show the title on a maroon band (area pages). */
  band?: boolean;
}

/** A titled evidence section. Hidden when the group is pending in production. */
export function EvidenceGroup({ group, headingLevel, index, band = false }: EvidenceGroupProps) {
  const headingId = useId();
  if (!groupHasVisibleContent(group)) return null;
  const heading = index === undefined ? group.title : `Evidence ${index}: ${group.title}`;

  return (
    // Band groups (area pages) leave more room under the title and 56px between blocks, so long documents stay apart.
    <section aria-labelledby={headingId} className={band ? 'space-y-6' : 'space-y-4'}>
      {band ? (
        <BandHeading level={headingLevel} id={headingId}>
          {heading}
        </BandHeading>
      ) : (
        <SectionHeading level={headingLevel} id={headingId}>
          {heading}
        </SectionHeading>
      )}
      {group.blocks.length === 0 ? (
        <PendingNotice label={group.title} />
      ) : (
        <div className={band ? 'space-y-14' : 'space-y-4'}>
          {group.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} label={`${group.title} photos`} />
          ))}
        </div>
      )}
    </section>
  );
}
