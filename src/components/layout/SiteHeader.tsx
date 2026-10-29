import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/brand/ucn-logo.png?w=64;128&format=webp&as=picture';
import { site } from '../../content';
import { routeManifest, type RouteEntry } from '../../content/routes';
import { toImageAsset } from '../../lib/images';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { buildNavModel } from './navModel';

const LOGO_HEIGHT = 48;
const seal = toImageAsset(logo, `${site.universityName} seal`);
const sealWidth = Math.round((LOGO_HEIGHT * seal.width) / seal.height);

interface SiteHeaderProps {
  /** Defaults to the app manifest; tests pass a fixture. */
  manifest?: readonly RouteEntry[];
}

export function SiteHeader({ manifest = routeManifest }: SiteHeaderProps) {
  const { pathname } = useLocation();
  const items = useMemo(() => buildNavModel(manifest, site.areasLabel), [manifest]);

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-h-11 items-center gap-3 rounded">
          <img
            src={seal.src}
            srcSet={seal.srcSet}
            sizes={`${sealWidth}px`}
            width={sealWidth}
            height={LOGO_HEIGHT}
            alt={seal.alt}
          />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold text-maroon-800">{site.universityName}</span>
            <span className="text-sm text-ink-muted">{site.schoolName}</span>
          </span>
        </Link>
        <DesktopNav items={items} pathname={pathname} />
        <MobileNav items={items} pathname={pathname} />
      </div>
    </header>
  );
}
