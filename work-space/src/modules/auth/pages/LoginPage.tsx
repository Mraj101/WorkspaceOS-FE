import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { APP_NAME } from '@/shared/constants/app';
import { Spinner } from '@/shared/ui';
import { LoginForm } from '../components/LoginForm';
import { useSession } from '../hooks/useSession';
import { REDIRECT_PARAM, safeRedirectPath } from '../utils/redirect';

export function LoginPage() {
  useDocumentTitle('Sign in');
  const session = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get(REDIRECT_PARAM));

  if (session.status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }
  if (session.status === 'authenticated') return <Navigate to={redirectTo} replace />;

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-medium text-muted">{APP_NAME}</p>
        <h1 className="mt-1 mb-6 text-2xl font-semibold">Sign in</h1>
        <LoginForm onSuccess={() => void navigate(redirectTo, { replace: true })} />
      </div>
    </main>
  );
}
