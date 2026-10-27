import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiError } from '@/shared/types/api';

/**
 * Expected backend error body. Adjust this single function when the backend contract
 * changes; every consumer works with `ApiError` and never parses raw responses.
 */
interface BackendErrorBody {
  message?: unknown;
  code?: unknown;
  errors?: unknown;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This change conflicts with the current state. Refresh and try again.',
  422: 'Some fields are invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
};

function readFieldErrors(errors: unknown): Record<string, string> | undefined {
  if (typeof errors !== 'object' || errors === null) return undefined;
  const result: Record<string, string> = {};
  for (const [field, value] of Object.entries(errors)) {
    const message: unknown = Array.isArray(value) ? value[0] : value;
    if (typeof message === 'string') result[field] = message;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function normalizeError(error: FetchBaseQueryError): ApiError {
  switch (error.status) {
    case 'FETCH_ERROR':
      return {
        status: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Check your connection.',
      };
    case 'TIMEOUT_ERROR':
      return { status: 'TIMEOUT', message: 'The server took too long to respond.' };
    case 'PARSING_ERROR':
      return {
        status: error.originalStatus >= 500 ? error.originalStatus : 'PARSE_ERROR',
        message: 'Received an unexpected response from the server.',
      };
    case 'CUSTOM_ERROR':
      return { status: 'UNKNOWN', message: error.error };
  }

  const body = (
    typeof error.data === 'object' && error.data !== null ? error.data : {}
  ) as BackendErrorBody;
  const fallback =
    STATUS_MESSAGES[error.status] ??
    (error.status >= 500
      ? 'The server encountered an error. Please try again.'
      : 'Request failed.');

  return {
    status: error.status,
    message: typeof body.message === 'string' && body.message ? body.message : fallback,
    ...(typeof body.code === 'string' && { code: body.code }),
    ...(readFieldErrors(body.errors) && { fieldErrors: readFieldErrors(body.errors) }),
  };
}
