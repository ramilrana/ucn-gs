import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';
import { Link } from 'react-router-dom';
import { currentFor, normalizePath, type NavItem } from './navModel';

interface DesktopNavProps {
  items: readonly NavItem[];
  pathname: string;
}

/** How many trailing top-level items open their dropdown right-aligned. */
const TRAILING_RIGHT_ANCHORED = 2;

const linkBase =
  'inline-flex min-h-11 items-center border-b-[3px] px-3 font-medium text-ink hover:text-maroon-800';

/** Visible from 1024px. Items with children are a link plus a separate 44px chevron button. */
export function DesktopNav({ items, pathname }: DesktopNavProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const idPrefix = useId();

  useEffect(() => {
    if (openLabel === null) return;
    const nav = navRef.current;
    const openItem = () => nav?.querySelector<HTMLElement>('[data-open="true"]') ?? null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const item = openItem();
      const hadFocus = item?.contains(document.activeElement) ?? false;
      setOpenLabel(null);
      if (hadFocus) item?.querySelector<HTMLButtonElement>('button')?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && openItem()?.contains(event.target)) return;
      setOpenLabel(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openLabel]);

  const closeWhenFocusLeaves = (label: string) => (event: FocusEvent<HTMLLIElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && !event.currentTarget.contains(next)) {
      setOpenLabel((current) => (current === label ? null : current));
    }
  };

  return (
    <nav ref={navRef} aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item, index) => {
          const current = currentFor(item, pathname);
          const linkClass = `${linkBase} ${current ? 'border-maroon-800 text-maroon-800' : 'border-transparent'}`;
          const children = item.children;

          if (!children) {
            return (
              <li key={item.path}>
                <Link to={item.path} aria-current={current} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            );
          }

          const panelId = `${idPrefix}-panel-${index}`;
          // The last items sit at the right edge of the header: a left-anchored 256px panel would overflow the viewport.
          const anchor = index >= items.length - TRAILING_RIGHT_ANCHORED ? 'right-0' : 'left-0';
          const open = openLabel === item.label;
          return (
            <li
              key={item.path}
              data-open={open}
              className="relative flex items-center"
              onBlur={closeWhenFocusLeaves(item.label)}
            >
              <Link to={item.path} aria-current={current} className={`${linkClass} pr-1`}>
                {item.label}
              </Link>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`${item.label} pages`}
                onClick={() => setOpenLabel(open ? null : item.label)}
                className="inline-flex size-11 items-center justify-center rounded text-maroon-800 hover:bg-paper"
              >
                <ChevronDown
                  aria-hidden="true"
                  className={`size-5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                />
              </button>
              <ul
                id={panelId}
                hidden={!open}
                className={`absolute ${anchor} top-full z-40 min-w-64 rounded border border-line bg-white py-1`}
              >
                {children.map((child) => {
                  const isCurrent = normalizePath(pathname) === child.path;
                  return (
                    <li key={child.path}>
                      <Link
                        to={child.path}
                        aria-current={isCurrent ? 'page' : undefined}
                        onClick={() => setOpenLabel(null)}
                        className={`flex min-h-11 items-center border-l-[3px] px-4 py-2 hover:bg-paper hover:text-maroon-800 ${
                          isCurrent ? 'border-maroon-800 font-semibold text-maroon-800' : 'border-transparent text-ink'
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
