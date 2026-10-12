import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Layout, Skeleton } from 'antd';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout.Content>
          <Suspense
            fallback={
              <div className="page-container page-body">
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            }
          >
            <AppRoutes />
          </Suspense>
        </Layout.Content>
        <AppFooter />
      </Layout>
    </BrowserRouter>
  );
}
