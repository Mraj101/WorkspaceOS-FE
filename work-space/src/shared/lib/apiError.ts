import type { ApiError } from '@/shared/types/api';

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

/** Safe user-facing message for any error value (RTK Query error, thrown Error, unknown). */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}
