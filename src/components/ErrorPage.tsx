import { useDocumentTitle } from '../lib/useDocumentTitle';

/**
 * Presentational "Something went wrong" page shared by the app-level and route-level error handlers.
 * It must work when the router itself failed, so the way home is a plain anchor, never a router Link.
 */
export function ErrorPage() {
  useDocumentTitle('Something went wrong');
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 px-4 py-16">
      <h1 id="page-title" tabIndex={-1} className="text-3xl font-semibold text-maroon-800">
        Something went wrong
      </h1>
      <p className="text-ink-muted">Please reload the page. If the problem continues, try again later.</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 rounded-md bg-maroon-800 px-5 text-white transition-[color,background-color,border-color] duration-150 hover:bg-maroon-900"
        >
          Reload page
        </button>
        <a
          href={import.meta.env.BASE_URL}
          className="inline-flex min-h-11 items-center rounded font-medium text-maroon-800 underline underline-offset-2 hover:text-maroon-900"
        >
          Go to the home page
        </a>
      </div>
    </main>
  );
}
