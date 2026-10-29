import { site } from '../content';
import { useRouteEntry } from '../app/useRouteEntry';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function HomePage() {
  const entry = useRouteEntry();
  useDocumentTitle(entry?.title ?? 'Home');
  return (
    // Placeholder until the Home page is built: the real h1 text, in the same type as other pages.
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
      <h1
        id="page-title"
        tabIndex={-1}
        className="font-serif text-3xl font-semibold leading-tight tracking-tight text-maroon-800 outline-none sm:text-4xl lg:text-5xl"
      >
        {`${site.universityName} Graduate School`}
      </h1>
    </div>
  );
}
