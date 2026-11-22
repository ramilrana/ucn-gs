import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';
import { Link } from 'react-router-dom';
import { currentFor, normalizePath, type NavChild, type NavItem } from './navModel';

interface DesktopNavProps {
  items: readonly NavItem[];
  pathname: string;
}

/** How many trailing top-level items open their dropdown right-aligned. */
const TRAILING_RIGHT_ANCHORED = 2;

const linkBase =
  'inline-flex min-h-11 items-center whitespace-nowrap border-b-[3px] px-1.5 text-sm font-medium text-ink hover:text-maroon-800 xl:px-3 xl:text-base';

/** Visible from 1024px. Items with children are a link plus a separate 44px chevron button. */
export function DesktopNav({ items, pathname }: DesktopNavProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  // The open third-level list (by its parent's path); reset whenever the dropdown closes or changes.
  const [openSub, setOpenSub] = useState<string | null>(null);
  useEffect(() => setOpenSub(null), [openLabel]);
  const navRef = useRef<HTMLElement>(null);
  const idPrefix = useId();

  useEffect(() => {
    if (openLabel === null) return;
    const nav = navRef.current;
    const openItem = () => nav?.querySelector<HTMLElement>('[data-open="true"]') ?? null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Escape closes the innermost open list first, returning focus to the button that opened it.
      const sub = nav?.querySelector<HTMLElement>('[data-sub-open="true"]');
      if (sub) {
        const hadSubFocus = sub.contains(document.activeElement);
        setOpenSub(null);
        if (hadSubFocus) sub.querySelector<HTMLButtonElement>('button')?.focus();
        return;
      }
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
      <ul className="flex items-center xl:gap-1">
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
              <Link to={item.path} aria-current={current} className={`${linkClass} pr-1 xl:pr-1`}>
                {item.label}
              </Link>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`${item.label} submenu`}
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
                {children.map((child) => (
                  <ChildRow
                    key={child.path}
                    child={child}
                    pathname={pathname}
                    panelId={`${panelId}-${child.path}`}
                    subOpen={openSub === child.path}
                    onToggleSub={() => setOpenSub((current) => (current === child.path ? null : child.path))}
                    onNavigate={() => setOpenLabel(null)}
                  />
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const childLink = (isCurrent: boolean) =>
  `flex min-h-11 flex-1 items-center border-l-[3px] px-4 py-2 hover:bg-paper hover:text-maroon-800 ${
    isCurrent ? 'border-maroon-800 font-semibold text-maroon-800' : 'border-transparent text-ink'
  }`;

function LinkText({ entry }: { entry: NavChild }) {
  return (
    <span>
      {entry.label}
      {entry.srSuffix && (
        <>
          {' '}
          <span className="sr-only">{entry.srSuffix}</span>
        </>
      )}
    </span>
  );
}

interface ChildRowProps {
  child: NavChild;
  pathname: string;
  panelId: string;
  subOpen: boolean;
  onToggleSub: () => void;
  onNavigate: () => void;
}

/**
 * One dropdown row. A row with its own children (an area under Compliance Report) adds a 44px chevron button that opens
 * them in a flyout to the right (disclosure pattern: Tab order, Escape closes it and returns focus to the button).
 */
function ChildRow({ child, pathname, panelId, subOpen, onToggleSub, onNavigate }: ChildRowProps) {
  const current = normalizePath(pathname);
  const isCurrent = current === child.path;
  const grandchildren = child.children ?? [];
  if (grandchildren.length === 0) {
    return (
      <li>
        <Link to={child.path} aria-current={isCurrent ? 'page' : undefined} onClick={onNavigate} className={childLink(isCurrent)}>
          <LinkText entry={child} />
        </Link>
      </li>
    );
  }
  const holdsCurrent = grandchildren.some((g) => g.path === current);
  return (
    <li data-sub-open={subOpen} className="relative flex items-stretch">
      <Link
        to={child.path}
        aria-current={isCurrent ? 'page' : undefined}
        onClick={onNavigate}
        className={childLink(isCurrent || holdsCurrent)}
      >
        <LinkText entry={child} />
      </Link>
      <button
        type="button"
        aria-expanded={subOpen}
        aria-controls={panelId}
        aria-label={`Show ${child.label} recommendations`}
        onClick={onToggleSub}
        className={`inline-flex w-11 shrink-0 items-center justify-center text-maroon-800 hover:bg-paper ${subOpen ? 'bg-paper' : ''}`}
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
      <ul
        id={panelId}
        hidden={!subOpen}
        className="absolute left-full top-0 z-50 -ml-px min-w-56 rounded border border-line bg-white py-1 shadow-md"
      >
        {grandchildren.map((g) => {
          const gCurrent = current === g.path;
          return (
            <li key={g.path}>
              <Link to={g.path} aria-current={gCurrent ? 'page' : undefined} onClick={onNavigate} className={childLink(gCurrent)}>
                <LinkText entry={g} />
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
