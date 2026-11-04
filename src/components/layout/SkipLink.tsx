/** First focusable element on every page; visible only while focused. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:min-h-11 focus:rounded focus:border focus:border-maroon-800 focus:bg-white focus:px-4 focus:py-2.5 focus:font-medium focus:text-maroon-800"
    >
      Skip to main content
    </a>
  );
}
