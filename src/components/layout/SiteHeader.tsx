import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { site } from '../../content';
import { routeManifest, type RouteEntry } from '../../content/routes';
import { seal, sealWidthFor } from './brand';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { buildNavModel } from './navModel';

const LOGO_HEIGHT = 48;
const sealWidth = sealWidthFor(LOGO_HEIGHT);

interface SiteHeaderProps {
  /** Defaults to the app manifest; tests pass a fixture. */
  manifest?: readonly RouteEntry[];
}

/**
 * The header sticks to the top on screens at least 30rem tall (on very short screens, such as a phone held sideways
 * or a 400% zoom, it scrolls away so it never covers most of the page). It publishes its height as --header-h, which
 * global.css uses as scroll-padding so anchors and keyboard focus are never hidden under it (WCAG 2.4.11).
 */
function useStickyHeader() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);
    publish();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(publish) : null;
    observer?.observe(header);

    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      root.style.removeProperty('--header-h');
    };
  }, []);

  return { ref, scrolled };
}

export function SiteHeader({ manifest = routeManifest }: SiteHeaderProps) {
  const { pathname } = useLocation();
  const items = useMemo(() => buildNavModel(manifest, site.areasLabel), [manifest]);
  const { ref, scrolled } = useStickyHeader();

  return (
    <header
      ref={ref}
      data-scrolled={scrolled || undefined}
      className="border-b border-line bg-white transition-shadow duration-200 tall:sticky tall:top-0 tall:z-40 tall:data-scrolled:shadow-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-4 xl:px-6">
        <Link to="/" className="flex min-h-11 min-w-0 items-center gap-3 rounded">
          <img
            src={seal.src}
            srcSet={seal.srcSet}
            sizes={`${sealWidth}px`}
            width={sealWidth}
            height={LOGO_HEIGHT}
            alt={seal.alt}
            className="shrink-0"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="break-words font-serif text-base font-semibold text-maroon-800 xl:text-lg">{site.universityName}</span>
            <span className="break-words text-sm text-ink-muted">{site.schoolName}</span>
          </span>
        </Link>
        <DesktopNav items={items} pathname={pathname} />
        <MobileNav items={items} pathname={pathname} />
      </div>
    </header>
  );
}
