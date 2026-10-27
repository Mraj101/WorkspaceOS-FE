import { Navigate, Outlet, useLocation } from 'react-router';
import { Alert, Button, Spinner } from '@/shared/ui';
import { useSession } from '../hooks/useSession';
import { loginPathWithRedirect } from '../utils/redirect';

/** Layout route guard: renders child routes only for signed-in users. */
export function RequireAuth() {
  const session = useSession();
  const location = useLocation();

  switch (session.status) {
    case 'loading':
      return (
        <div className="grid min-h-dvh place-items-center">
          <Spinner label="Checking your session" />
        </div>
      );
    case 'error':
      return (
        <div className="mx-auto max-w-md p-6">
          <Alert
            title="We couldn't verify your session"
            action={
              <Button size="sm" variant="secondary" onClick={session.retry}>
                Try again
              </Button>
            }
          >
            {session.error.message}
          </Alert>
        </div>
      );
    case 'anonymous':
      return (
        <Navigate to={loginPathWithRedirect(`${location.pathname}${location.search}`)} replace />
      );
    case 'authenticated':
      return <Outlet />;
  }
}
