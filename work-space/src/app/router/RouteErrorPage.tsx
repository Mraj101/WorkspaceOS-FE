import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { buttonStyles } from '@/shared/ui';

/**
 * Route-level error boundary. Catches render errors and failed lazy-chunk loads (e.g. after
 * a deploy invalidates old chunks) so one broken page never blanks the whole app.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = notFound ? 'Page not found' : 'Something went wrong';
  useDocumentTitle(title);

  if (import.meta.env.DEV && !notFound) console.error(error);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted">
        {notFound
          ? "The page you're looking for doesn't exist or has moved."
          : 'An unexpected error occurred. Reloading usually fixes it.'}
      </p>
      <div className="flex gap-2">
        {!notFound && (
          <button
            type="button"
            className={buttonStyles()}
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload
          </button>
        )}
        <Link to="/" className={buttonStyles('secondary')}>
          Go home
        </Link>
      </div>
    </main>
  );
}
