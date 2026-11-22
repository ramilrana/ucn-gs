import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { FALLBACK_IMAGE } from '../../lib/fallbackImage';
import type { ImageAsset } from '../../types/content';

interface HeroCarouselProps {
  label: string;
  slides: readonly ImageAsset[];
  /** Time each slide stays before the next one slides in. */
  intervalMs?: number;
  /** Largest slide width in px (default 1056, the leadership slides' own width). */
  slideMaxWidth?: number;
}

// Each slide is 80% of the width, at most `slideMaxWidth` (so it stays sharp); the track shifts so the current
// slide is centred and the neighbours' edges show on both sides ("peek", the user's choice 2026-11-20).
const DEFAULT_SLIDE_MAX_WIDTH = 1056;

const SWIPE_DISTANCE = 40;
export const HERO_INTERVAL_MS = 4000;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches;

const roundButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-white text-white hover:bg-maroon-800';

/**
 * Full-width "peek" carousel for the Home leadership slides: slides move sideways, advance on their own, and can be moved
 * by buttons, dots, arrow keys or swipe. Auto-advance (user's request 2026-11-20, replacing D8 for this carousel)
 * follows WCAG 2.2.2 and the APG auto-rotating carousel pattern: the Pause/Play button comes first; it pauses while the
 * mouse is over it; keyboard focus entering it stops rotation until the user presses Play (Play also overrides the hover
 * pause). With reduced motion (at load or switched on later) it is paused, and slides change without animation.
 */
export function HeroCarousel({
  label,
  slides,
  intervalMs = HERO_INTERVAL_MS,
  slideMaxWidth = DEFAULT_SLIDE_MAX_WIDTH,
}: HeroCarouselProps) {
  const peekWidth = `min(80%, ${slideMaxWidth}px)`;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(reducedMotion);
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState<ReadonlySet<number>>(() => new Set());
  const swipeStart = useRef<number | null>(null);
  // The last input anywhere on the page. Only focus that arrives after a key press counts as keyboard entry: a mouse
  // click or a tap (Android focuses on the mousedown that follows pointerup) or returning to the window does not.
  const lastInput = useRef<'keyboard' | 'pointer' | null>(null);

  const count = slides.length;
  const multiple = count > 1;
  const current = Math.min(index, Math.max(count - 1, 0));
  const playing = multiple && !userPaused && !hovered;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearTimeout(timer);
  }, [playing, current, count, intervalMs]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      // Alt-Tab and other system shortcuts are not navigation inside the page (Shift+Tab is).
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      lastInput.current = 'keyboard';
    };
    const onPointer = () => {
      lastInput.current = 'pointer';
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onPointer, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onPointer, true);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const query = window.matchMedia(REDUCED_MOTION);
    if (typeof query.addEventListener !== 'function') return undefined;
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setUserPaused(true);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  if (count === 0) return null;

  const go = (next: number) => setIndex(((next % count) + count) % count);
  const currentAlt = slides[current]?.alt;

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
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => {
        const entering = !e.currentTarget.contains(e.relatedTarget as Node | null);
        if (entering && lastInput.current === 'keyboard') setUserPaused(true);
      }}
      className="on-maroon relative w-full bg-maroon-900 pt-6 sm:pt-8"
    >
      <div
        data-swipe-area=""
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
        className="relative touch-pan-y overflow-hidden"
      >
        <div
          data-track=""
          className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(calc(50% - ${current + 0.5} * ${peekWidth}))` }}
        >
          {slides.map((slide, i) => {
            const broken = failed.has(i);
            const isCurrent = i === current;
            return (
              <div
                key={`${slide.src}-${i}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={isCurrent ? undefined : true}
                inert={!isCurrent}
                style={{ maxWidth: slideMaxWidth }}
                className={`w-[80%] shrink-0 px-1.5 transition-opacity duration-700 motion-reduce:transition-none sm:px-3 ${
                  isCurrent ? '' : 'opacity-40'
                }`}
              >
                <img
                  src={broken ? FALLBACK_IMAGE : slide.src}
                  srcSet={broken ? undefined : slide.srcSet}
                  sizes={`(min-width: ${Math.round(slideMaxWidth / 0.8)}px) ${slideMaxWidth}px, 80vw`}
                  width={slide.width}
                  height={slide.height}
                  alt={slide.alt}
                  // The current slide and its neighbours load now, so a slide is ready before it moves in.
                  loading={Math.abs(i - current) <= 1 || (current === count - 1 && i === 0) ? 'eager' : 'lazy'}
                  draggable={false}
                  onError={() => setFailed((prev) => new Set(prev).add(i))}
                  className="block h-auto w-full rounded shadow-lg"
                />
              </div>
            );
          })}
        </div>

      </div>

      {/* Controls sit below the slides so they never cover the names printed on them. */}
      {multiple && (
        <div className="flex items-center justify-center gap-3 px-4 py-3">
          {/* The rotation control comes first (APG), so it is the first stop for keyboard and screen-reader users. */}
          <button
            type="button"
            aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
            onClick={() => {
              // An explicit Play overrides the hover pause: the user asked for it while the pointer is still here.
              if (userPaused) setHovered(false);
              setUserPaused(!userPaused);
            }}
            className={roundButton}
          >
            {userPaused ? <Play aria-hidden="true" className="size-5" /> : <Pause aria-hidden="true" className="size-5" />}
          </button>
          <button type="button" aria-label="Previous slide" onClick={() => go(current - 1)} className={roundButton}>
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
                  className={`block rounded-full border-2 border-white ${i === current ? 'size-4 bg-gold-500' : 'size-3 bg-transparent'}`}
                />
              </button>
            ))}
          </div>
          <button type="button" aria-label="Next slide" onClick={() => go(current + 1)} className={roundButton}>
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
        </div>
      )}

      {/* Announce slide changes only while not rotating on its own, so a screen reader is not interrupted every few seconds. */}
      {multiple && (
        <p aria-live={playing ? 'off' : 'polite'} className="sr-only">
          {`Slide ${current + 1} of ${count}${currentAlt ? `: ${currentAlt}` : ''}`}
        </p>
      )}
    </section>
  );
}
