import { ErrorPage } from '../components/ErrorPage';

/** Root route ErrorBoundary: replaces React Router's default error screen, including for failed lazy() chunk imports. */
export function RouteErrorPage() {
  return <ErrorPage />;
}
