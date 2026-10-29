import type { ResourceFormat } from '../../types/content';

const labels: Record<ResourceFormat, string> = {
  pdf: 'PDF',
  video: 'Video',
  folder: 'Folder',
  doc: 'Doc',
  link: 'Link',
  image: 'Image',
};

/** Format label as text, never color alone. */
export function Badge({ format }: { format: ResourceFormat }) {
  return (
    <span className="inline-flex items-center rounded border border-line bg-paper px-2 py-0.5 text-xs font-semibold text-ink-muted">
      {labels[format]}
    </span>
  );
}
