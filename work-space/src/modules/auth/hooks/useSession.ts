import type { ApiError } from '@/shared/types/api';
import { useGetSessionQuery } from '../api/authApi';
import type { User } from '../types/auth';

export type SessionState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'anonymous' }
  | { status: 'error'; error: ApiError; retry: () => void };

/** The one way to ask "who is the current user?" anywhere in the app. */
export function useSession(): SessionState {
  const { data, error, isLoading, refetch } = useGetSessionQuery();

  if (isLoading) return { status: 'loading' };
  if (data)
    return data.user ? { status: 'authenticated', user: data.user } : { status: 'anonymous' };
  if (error) {
    return {
      status: 'error',
      error: error as ApiError,
      retry: () => void refetch(),
    };
  }
  return { status: 'loading' };
}
