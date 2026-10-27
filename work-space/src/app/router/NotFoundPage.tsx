import { Link } from 'react-router';
import { buttonStyles, EmptyState, PageHeader } from '@/shared/ui';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <EmptyState
        title="Nothing here"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link to="/" className={buttonStyles('secondary')}>
            Go home
          </Link>
        }
      />
    </>
  );
}
