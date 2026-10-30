import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAccessProps {
  /** The visible label of the first link (content/site.ts, so "Accreditation Scope" is a one-line change). */
  areasLabel: string;
}

const tile =
  'flex h-full min-h-16 items-center justify-between gap-3 rounded border border-line bg-white px-4 py-3 font-serif text-lg font-semibold leading-snug text-maroon-800 transition-colors duration-150 hover:border-maroon-800 hover:text-maroon-900';

/** The four principal accreditation resources, one tap from the top of the Home page. */
export function QuickAccess({ areasLabel }: QuickAccessProps) {
  const links = [
    { to: '/accreditation-areas', label: areasLabel },
    { to: '/compliance-report', label: 'Compliance Report' },
    { to: '/avp', label: 'Audio Visual Presentations' },
    { to: '/certificate-of-authenticity', label: 'Certificate of Authenticity' },
  ];
  return (
    <nav aria-label="Principal accreditation resources" className="border-b border-line bg-paper">
      <ul className="mx-auto grid max-w-7xl gap-3 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={tile}>
              {link.label}
              <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
