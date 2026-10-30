import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { FALLBACK_IMAGE } from '../../lib/fallbackImage';
import type { ImageAsset } from '../../types/content';

interface SlideshowProps {
  label: string;
  slides: readonly ImageAsset[];
}

const SWIPE_DISTANCE = 40;

const arrowButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded border border-maroon-800 bg-white text-maroon-800 hover:bg-paper';

/** Manual-only slideshow (no autoplay): buttons, dots, arrow keys and swipe. */
export function Slideshow({ label, slides }: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<ReadonlySet<number>>(() => new Set());
  const swipeStart = useRef<number | null>(null);

  const count = slides.length;
  if (count === 0) return null;

  // Content could shrink between renders; never point past the last slide.
  const current = Math.min(index, count - 1);
  const multiple = count > 1;
  const currentAlt = slides[current]?.alt;
  const go = (next: number) => setIndex(((next % count) + count) % count);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!multiple || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(current + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current - 1);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null || !multiple) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) > SWIPE_DISTANCE) go(delta < 0 ? current + 1 : current - 1);
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown}>
      <div
        data-swipe-area=""
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
        className="touch-pan-y"
      >
        {slides.map((slide, i) => {
          const broken = failed.has(i);
          return (
            <div
              key={`${slide.src}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              hidden={i !== current}
            >
              <img
                src={broken ? FALLBACK_IMAGE : slide.src}
                srcSet={broken ? undefined : slide.srcSet}
                sizes="(min-width: 1024px) 960px, 100vw"
                width={slide.width}
                height={slide.height}
                alt={slide.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
                onError={() => setFailed((prev) => new Set(prev).add(i))}
                className="mx-auto h-auto max-h-[70vh] w-auto max-w-full rounded border border-line object-contain"
              />
              {slide.caption && <p className="mt-2 text-sm text-ink-muted">{slide.caption}</p>}
            </div>
          );
        })}
      </div>

      {multiple && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button type="button" aria-label="Previous slide" onClick={() => go(current - 1)} className={arrowButton}>
            <ChevronLeft aria-hidden="true" className="size-6" />
          </button>
          <div className="flex flex-wrap items-center justify-center gap-x-1">
            {slides.map((slide, i) => (
              <button
                key={`${slide.src}-${i}`}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => go(i)}
                className="inline-flex size-6 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full border-2 border-maroon-800 ${
                    i === current ? 'size-4 bg-maroon-800' : 'size-3 bg-white'
                  }`}
                />
              </button>
            ))}
          </div>
          <button type="button" aria-label="Next slide" onClick={() => go(current + 1)} className={arrowButton}>
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
        </div>
      )}

      {multiple && (
        <p aria-live="polite" className="sr-only">
          {`Slide ${current + 1} of ${count}${currentAlt ? `: ${currentAlt}` : ''}`}
        </p>
      )}
    </section>
  );
}
