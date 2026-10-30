import { useId } from 'react';
import { isVisible } from '../../lib/published';
import type { EvidenceGroup as EvidenceGroupData } from '../../types/content';
import { SectionHeading } from '../ui/SectionHeading';
import { BlockRenderer } from './BlockRenderer';
import { PendingNotice } from './PendingNotice';

interface EvidenceGroupProps {
  group: EvidenceGroupData;
  headingLevel: 2 | 3;
  index?: number;
}

/** A titled evidence section. Hidden when the group is pending in production. */
export function EvidenceGroup({ group, headingLevel, index }: EvidenceGroupProps) {
  const headingId = useId();
  if (!isVisible(group)) return null;
  const heading = index === undefined ? group.title : `Evidence ${index}: ${group.title}`;

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <SectionHeading level={headingLevel} id={headingId}>
        {heading}
      </SectionHeading>
      {group.blocks.length === 0 ? (
        <PendingNotice label={group.title} />
      ) : (
        group.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} label={`${group.title} photos`} />
        ))
      )}
    </section>
  );
}
