import { PageShell } from '../components/layout/PageShell';
import { ActionLink } from '../components/ui/ActionLink';

export default function NotFoundPage() {
  return (
    <PageShell title="Page not found" hasContent>
      <p className="max-w-[70ch]">The page you asked for does not exist or has moved.</p>
      <p className="mt-4">
        <ActionLink href="/">Go to the home page</ActionLink>
      </p>
    </PageShell>
  );
}
