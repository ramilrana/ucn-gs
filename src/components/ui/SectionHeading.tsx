import type { ReactNode } from 'react';

interface SectionHeadingProps {
  level: 2 | 3;
  id?: string;
  /** Pass -1 to make the heading a programmatic focus target (not in the tab order). */
  tabIndex?: -1;
  children: ReactNode;
}

// The gold rule is a pseudo-element that is only drawn inside .on-maroon. D9 forbids gold as text, focus ring or
// state indicator on white or paper; a decorative rule on white would be allowed (spec section 5), but this heading omits it there.
const rule =
  "after:hidden after:content-[''] [.on-maroon_&]:after:block after:mt-2 after:h-0.5 after:w-12 after:bg-gold-500";
const sizes = { 2: 'text-2xl', 3: 'text-xl' } as const;

export function SectionHeading({ level, id, tabIndex, children }: SectionHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <Tag
      id={id}
      tabIndex={tabIndex}
      className={`font-serif font-semibold text-maroon-800 [.on-maroon_&]:text-white ${sizes[level]} ${rule}`}
    >
      {children}
    </Tag>
  );
}
