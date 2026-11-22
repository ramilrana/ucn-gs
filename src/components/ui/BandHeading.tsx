interface BandHeadingProps {
  level?: 2 | 3;
  id?: string;
  children: React.ReactNode;
}

/**
 * A dominant section title: white serif text on a maroon band with a gold left edge (the About and People style,
 * used on area pages from 2026-11-22). Gold only on maroon (D9); `on-maroon` gives focus rings their gold colour.
 */
export function BandHeading({ level = 2, id, children }: BandHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <div className="on-maroon rounded border-l-8 border-gold-500 bg-maroon-800 px-5 py-3 sm:px-6 sm:py-4">
      <Tag id={id} className="font-serif text-2xl font-semibold text-white sm:text-3xl">
        {children}
      </Tag>
    </div>
  );
}
