import { BadgeCheck, ClipboardCheck, FolderOpen, MonitorPlay, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAccessProps {
  /** The visible label of the areas link (content/site.ts, so "Accreditation Scope" is a one-line change). */
  areasLabel: string;
}

// Maroon tiles with a gold icon ring (the user's pick of four previewed designs, 2026-11-20). Gold appears only on
// maroon (D9). The focus ring stays the default maroon: it is drawn outside the tile, on the light band.
const tile =
  'group flex h-full min-h-20 items-center gap-4 rounded-lg border-b-4 border-transparent bg-maroon-800 px-5 py-4 shadow-md transition duration-150 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-maroon-900 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/** The four principal accreditation resources, one tap from the top of the Home page, in the header's order. */
export function QuickAccess({ areasLabel }: QuickAccessProps) {
  const links: { to: string; label: string; Icon: LucideIcon }[] = [
    { to: '/certificate-of-authenticity', label: 'Certificate of Authenticity', Icon: BadgeCheck },
    { to: '/compliance-report', label: 'Compliance Report', Icon: ClipboardCheck },
    { to: '/accreditation-areas', label: areasLabel, Icon: FolderOpen },
    { to: '/avp', label: 'Audio Visual Presentations', Icon: MonitorPlay },
  ];
  return (
    <nav aria-label="Principal accreditation resources" className="border-b border-line bg-paper">
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {links.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link to={to} className={tile}>
              <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-gold-500">
                <Icon className="size-6 text-gold-500" />
              </span>
              <span className="min-w-0 break-words font-serif text-lg font-semibold leading-snug text-white">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
