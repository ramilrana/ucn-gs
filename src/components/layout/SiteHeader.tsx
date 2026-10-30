import { useMemo } from 'react';
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

export function SiteHeader({ manifest = routeManifest }: SiteHeaderProps) {
  const { pathname } = useLocation();
  const items = useMemo(() => buildNavModel(manifest, site.areasLabel), [manifest]);

  return (
    <header className="border-b border-line bg-white">
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
