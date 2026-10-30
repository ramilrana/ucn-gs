/** Presentational "Something went wrong" page shared by the app-level and route-level error handlers. */
export function ErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 px-4 py-16">
      <h1 id="page-title" tabIndex={-1} className="text-3xl font-semibold text-maroon-800">
        Something went wrong
      </h1>
      <p className="text-ink-muted">Please reload the page. If the problem continues, try again later.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-11 rounded-md bg-maroon-800 px-5 text-white transition-colors duration-150 hover:bg-maroon-900"
      >
        Reload page
      </button>
    </main>
  );
}
