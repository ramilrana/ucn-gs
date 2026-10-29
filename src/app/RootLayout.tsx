import { Suspense, useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { SiteHeader } from '../components/layout/SiteHeader';
import { SkipLink } from '../components/layout/SkipLink';
import { RouteLoading } from './RouteLoading';

const GIVE_UP_MS = 5000;

function focusPageTitle(): boolean {
  const heading = document.getElementById('page-title');
  if (!heading) return false;
  heading.focus({ preventScroll: true });
  return true;
}

/**
 * Moves focus to the page h1 after client navigation, never on first load.
 * A lazily loaded page can mount its h1 after the pathname changes, so wait for it briefly.
 */
function useFocusPageTitleOnNavigation(): void {
  const { pathname } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (focusPageTitle()) return;

    const observer = new MutationObserver(() => {
      if (focusPageTitle()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setTimeout(() => observer.disconnect(), GIVE_UP_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);
}

export function RootLayout() {
  useFocusPageTitleOnNavigation();

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollRestoration />
    </>
  );
}
