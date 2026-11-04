import { useRouteEntry } from '../app/useRouteEntry';
import { areas } from '../content';
import { AvpView } from '../features/avp/AvpView';
import NotFoundPage from './NotFoundPage';

export default function AvpPage() {
  const entry = useRouteEntry();
  if (!entry) return <NotFoundPage />;
  return <AvpView areas={areas} />;
}
