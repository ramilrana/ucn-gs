import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../../content';
import { routeManifest, type RouteEntry } from '../../content/routes';
import { slotValue } from '../../lib/published';
import type { SiteContent } from '../../types/content';
import { ActionLink } from '../ui/ActionLink';
import { seal, sealWidthFor } from './brand';
import { buildNavModel } from './navModel';

const LOGO_HEIGHT = 56;
const sealWidth = sealWidthFor(LOGO_HEIGHT);

interface SiteFooterProps {
  /** Defaults to the app manifest; tests pass a fixture. */
  manifest?: readonly RouteEntry[];
  /** Defaults to the site contact slot; tests pass a published one. */
  contact?: SiteContent['contact'];
}

/** "2026-10-29" as "October 29, 2026". Read as UTC so the day never shifts with the viewer's time zone. */
function formatContentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-PH', { dateStyle: 'long', timeZone: 'UTC' });
}

const footerLink = 'inline-flex min-h-11 items-center rounded';

export function SiteFooter({ manifest = routeManifest, contact = site.contact }: SiteFooterProps) {
  const items = useMemo(() => buildNavModel(manifest, site.areasLabel), [manifest]);
  const details = slotValue(contact);

  return (
    <footer className="on-maroon bg-maroon-900 text-white">
      <div
        className={`mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 ${
          details ? 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]' : ''
        }`}
      >
        <div>
          <Link to="/" className="flex w-fit items-center gap-4 rounded">
            <span className="rounded-full bg-white p-1">
              <img
                src={seal.src}
                srcSet={seal.srcSet}
                sizes={`${sealWidth}px`}
                width={sealWidth}
                height={LOGO_HEIGHT}
                alt={seal.alt}
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-xl font-semibold">{site.universityName}</span>
              <span>{site.schoolName}</span>
            </span>
          </Link>
        </div>

        {details && (
          <div>
            <h2 className="font-serif text-lg font-semibold">Contact</h2>
            <div aria-hidden="true" className="mt-2 h-[3px] w-10 bg-gold-500" />
            <address className="mt-4 space-y-2 not-italic">
              <p>{details.address}</p>
              {details.email && (
                <p>
                  <ActionLink href={`mailto:${details.email}`}>{details.email}</ActionLink>
                </p>
              )}
              {details.phone && (
                <p>
                  <ActionLink href={`tel:${details.phone.replace(/[^\d+]/g, '')}`}>{details.phone}</ActionLink>
                </p>
              )}
              {details.hours && <p>{details.hours}</p>}
            </address>
          </div>
        )}

        <nav aria-label="Footer">
          <h2 className="font-serif text-lg font-semibold">Explore</h2>
          <div aria-hidden="true" className="mt-2 h-[3px] w-10 bg-gold-500" />
          <ul className={`mt-4 grid grid-cols-1 gap-x-8 gap-y-1 ${details ? '' : 'sm:grid-flow-col sm:grid-rows-3'}`}>
            {items.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={`${footerLink} underline underline-offset-2 hover:no-underline`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-maroon-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-sm sm:flex-row sm:justify-between sm:px-6">
          <p>Content last updated {formatContentDate(site.contentUpdated)}</p>
          <p>© {new Date().getFullYear()} {site.universityName}</p>
        </div>
      </div>
    </footer>
  );
}
