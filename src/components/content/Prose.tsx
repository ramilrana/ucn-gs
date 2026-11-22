/**
 * Body copy at a readable measure. `lang` marks passages in another language. `columns` flows short, single-screen
 * blocks into two columns from lg (each about 70 characters a line); only use it where both columns fit on one screen.
 */
export function Prose({ paragraphs, lang, columns = false }: { paragraphs: readonly string[]; lang?: string; columns?: boolean }) {
  if (columns) {
    return (
      <div lang={lang} className="lg:columns-2 lg:gap-12">
        {paragraphs.map((text, i) => (
          <p key={i} className="mb-4 max-w-[70ch] leading-relaxed text-ink last:mb-0">
            {text}
          </p>
        ))}
      </div>
    );
  }
  return (
    <div lang={lang} className="space-y-4">
      {paragraphs.map((text, i) => (
        <p key={i} className="max-w-[70ch] leading-relaxed text-ink">
          {text}
        </p>
      ))}
    </div>
  );
}
