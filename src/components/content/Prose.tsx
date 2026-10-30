/** Body copy at a readable measure. `lang` marks passages in another language. */
export function Prose({ paragraphs, lang }: { paragraphs: readonly string[]; lang?: string }) {
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
