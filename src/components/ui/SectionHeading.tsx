import type { ReactNode } from 'react';

interface SectionHeadingProps {
  level: 2 | 3;
  id?: string;
  children: ReactNode;
}

// The gold rule is a pseudo-element that only exists inside .on-maroon (D9: no gold on white or paper).
const rule =
  "after:hidden after:content-[''] [.on-maroon_&]:after:block after:mt-2 after:h-0.5 after:w-12 after:bg-gold-500";
const sizes = { 2: 'text-2xl', 3: 'text-xl' } as const;

export function SectionHeading({ level, id, children }: SectionHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <Tag
      id={id}
      className={`font-serif font-semibold text-maroon-800 [.on-maroon_&]:text-white ${sizes[level]} ${rule}`}
    >
      {children}
    </Tag>
  );
}
