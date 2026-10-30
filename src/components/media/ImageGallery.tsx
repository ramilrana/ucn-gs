import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { FALLBACK_IMAGE } from '../../lib/fallbackImage';
import type { ImageAsset } from '../../types/content';

interface ImageGalleryProps {
  label: string;
  images: readonly ImageAsset[];
}

/** Larger galleries (the reference has 74-photo pages) start collapsed to keep the page light. */
const INITIAL_LIMIT = 24;

const iconButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded border border-maroon-800 bg-white text-maroon-800 hover:bg-paper';

const thumbName = (image: ImageAsset, i: number) => image.alt || image.caption || `Image ${i + 1}`;

/** Thumbnail grid that opens each image in a native modal <dialog> viewer. */
export function ImageGallery({ label, images }: ImageGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const firstRevealedRef = useRef<HTMLButtonElement | null>(null);

  // showModal runs after the viewer content has rendered, so the browser focuses real controls.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (openIndex === null || !dialog) return;
    if (!dialog.open) dialog.showModal();
    // Browsers focus the first control themselves; make that explicit so keys work everywhere.
    if (!dialog.contains(document.activeElement)) closeRef.current?.focus();
  }, [openIndex]);

  // The "Show all" button unmounts when pressed; hand focus to the first photo it revealed.
  useEffect(() => {
    if (expanded) firstRevealedRef.current?.focus();
  }, [expanded]);

  const count = images.length;
  if (count === 0) return null;

  const visible = expanded ? images : images.slice(0, INITIAL_LIMIT);
  const markFailed = (key: string) => setFailed((prev) => new Set(prev).add(key));
  const current = openIndex === null ? undefined : images[Math.min(openIndex, count - 1)];
  const currentIndex = openIndex === null ? 0 : Math.min(openIndex, count - 1);
  const multiple = count > 1;
  const step = (delta: number) => setOpenIndex(((currentIndex + delta) % count + count) % count);

  const onOpen = (event: MouseEvent<HTMLButtonElement>, i: number) => {
    openerRef.current = event.currentTarget;
    setOpenIndex(i);
  };

  // Fires for Close, Esc (native cancel -> close) and backdrop clicks alike.
  const onClose = () => {
    setOpenIndex(null);
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener?.isConnected) opener.focus();
  };

  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    // The backdrop is part of the dialog element itself; the content fills the rest.
    if (event.target === event.currentTarget) dialogRef.current?.close();
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (!multiple || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  const viewerKey = `viewer-${currentIndex}`;
  const viewerBroken = failed.has(viewerKey);

  return (
    <section aria-label={label}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((image, i) => {
          const key = `thumb-${i}`;
          const broken = failed.has(key);
          return (
            <li key={`${image.src}-${i}`}>
              <button
                type="button"
                ref={i === INITIAL_LIMIT ? firstRevealedRef : undefined}
                aria-label={`View image: ${thumbName(image, i)}`}
                onClick={(event) => onOpen(event, i)}
                className="block w-full overflow-hidden rounded border border-line bg-paper hover:border-maroon-800"
              >
                <img
                  src={broken ? FALLBACK_IMAGE : image.src}
                  srcSet={broken ? undefined : image.srcSet}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  width={image.width}
                  height={image.height}
                  alt=""
                  loading="lazy"
                  onError={() => markFailed(key)}
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {!expanded && count > INITIAL_LIMIT && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-11 items-center rounded border border-maroon-800 px-4 font-medium text-maroon-800 hover:bg-paper"
          >
            {`Show all ${count} photos`}
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label={label}
        onClose={onClose}
        onClick={onDialogClick}
        onKeyDown={onDialogKeyDown}
        className="m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-5xl overflow-y-auto rounded border border-line bg-white p-0 text-ink backdrop:bg-ink/70"
      >
        {current && (
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <p aria-live="polite" className="font-medium text-ink">
                {`Image ${currentIndex + 1} of ${count}`}
                {current.alt && <span className="sr-only">{`: ${current.alt}`}</span>}
              </p>
              <button
                type="button"
                ref={closeRef}
                onClick={() => dialogRef.current?.close()}
                className="inline-flex min-h-11 items-center gap-2 rounded px-3 font-medium text-maroon-800 hover:bg-paper"
              >
                <X aria-hidden="true" className="size-5" />
                Close
              </button>
            </div>
            <img
              src={viewerBroken ? FALLBACK_IMAGE : current.src}
              srcSet={viewerBroken ? undefined : current.srcSet}
              sizes="(min-width: 1024px) 960px, 100vw"
              width={current.width}
              height={current.height}
              alt={current.alt}
              onError={() => markFailed(viewerKey)}
              className="mx-auto h-auto max-h-[70dvh] w-full object-contain"
            />
            {current.caption && <p className="text-sm text-ink-muted">{current.caption}</p>}
            {multiple && (
              <div className="flex items-center justify-between gap-3">
                <button type="button" aria-label="Previous image" onClick={() => step(-1)} className={iconButton}>
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>
                <button type="button" aria-label="Next image" onClick={() => step(1)} className={iconButton}>
                  <ChevronRight aria-hidden="true" className="size-6" />
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
