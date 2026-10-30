import { Menu, X } from 'lucide-react';
import { useEffect, useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Disclosure } from '../ui/Disclosure';
import { currentFor, isActive, normalizePath, type NavItem } from './navModel';

interface MobileNavProps {
  items: readonly NavItem[];
  pathname: string;
}

const rowClass = 'flex min-h-11 items-center border-l-[3px] px-3 py-2';
const rowState = (current: boolean) =>
  current ? 'border-maroon-800 font-semibold text-maroon-800' : 'border-transparent text-ink';

/** Below 1024px: a Menu button that opens a modal <dialog> with collapsible groups. */
export function MobileNav({ items, pathname }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // A modal left open while the window grows to desktop width would hide the page for no reason.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target;
    // Choosing a link, or clicking the backdrop (the dialog element itself), closes the menu.
    if (target === event.currentTarget || (target instanceof Element && target.closest('a'))) {
      dialogRef.current?.close();
    }
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-11 items-center gap-2 rounded border border-maroon-800 px-4 font-medium text-maroon-800 hover:bg-paper"
      >
        <Menu aria-hidden="true" className="size-5" />
        Menu
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        onClick={onDialogClick}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm overflow-y-auto bg-white p-0 text-ink backdrop:bg-ink/60"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <span className="font-serif text-lg font-semibold text-maroon-800">Menu</span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex min-h-11 items-center gap-2 rounded px-3 font-medium text-maroon-800 hover:bg-paper"
          >
            <X aria-hidden="true" className="size-5" />
            Close
          </button>
        </div>
        <nav aria-label="Mobile" className="px-4 py-2">
          <ul>
            {items.map((item) => {
              const current = currentFor(item, pathname);
              const children = item.children;
              if (!children) {
                return (
                  <li key={item.path} className="border-b border-line">
                    <Link
                      to={item.path}
                      aria-current={current}
                      className={`${rowClass} ${rowState(current !== undefined)}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              // The parent keeps its own link unless it is the same page as one of its children.
              const overviewIsChild = children.some((child) => child.path === item.path);
              // defaultOpen is only read at mount, and the dialog stays mounted across navigations,
              // so the key re-mounts the group (open when it holds the current page) on every navigation.
              const active = isActive(item, pathname);
              return (
                <li key={item.path}>
                  <Disclosure
                    key={`${normalizePath(pathname)}:${active}`}
                    summary={item.label}
                    defaultOpen={active}
                  >
                    <ul>
                      {!overviewIsChild && (
                        <li>
                          <Link
                            to={item.path}
                            aria-current={current === 'page' ? 'page' : undefined}
                            className={`${rowClass} ${rowState(current === 'page')}`}
                          >
                            {item.label} overview
                          </Link>
                        </li>
                      )}
                      {children.map((child) => {
                        const isCurrent = normalizePath(pathname) === child.path;
                        return (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              aria-current={isCurrent ? 'page' : undefined}
                              className={`${rowClass} ${rowState(isCurrent)}`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </Disclosure>
                </li>
              );
            })}
          </ul>
        </nav>
      </dialog>
    </div>
  );
}
