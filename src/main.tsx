import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/global.css';
import { createAppRouter } from './app/router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { dismissSplash, GIVE_UP_MS } from './app/splash';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

// Never leave the splash covering the page if the app fails to report ready.
window.setTimeout(dismissSplash, GIVE_UP_MS);

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={createAppRouter()} />
    </ErrorBoundary>
  </StrictMode>,
);
