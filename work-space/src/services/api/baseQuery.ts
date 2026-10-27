import {
  fetchBaseQuery,
  retry,
  type BaseQueryFn,
  type FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { env } from '@/shared/config/env';
import type { ApiError } from '@/shared/types/api';
import { normalizeError } from './normalizeError';

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  // Session is carried by an HttpOnly cookie set by the backend; no token lives in JS.
  credentials: 'include',
  timeout: REQUEST_TIMEOUT_MS,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

/** Every endpoint receives errors as `ApiError`, regardless of the failure mode. */
const normalizedBaseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) return { error: normalizeError(result.error), meta: result.meta };
  return { data: result.data, meta: result.meta };
};

function isTransient(error: ApiError) {
  return (
    error.status === 'NETWORK_ERROR' ||
    error.status === 'TIMEOUT' ||
    error.status === 429 ||
    (typeof error.status === 'number' && error.status >= 500)
  );
}

/**
 * Retry policy:
 * - Queries (reads, idempotent) retry transient failures with exponential backoff.
 * - Mutations never retry automatically: a timed-out POST may already have succeeded on
 *   the server, and replaying it could create duplicates. Users retry mutations explicitly.
 * - Endpoints can opt out with `extraOptions: { maxRetries: 0 }`.
 */
export const baseQuery = retry(normalizedBaseQuery, {
  // A custom retryCondition replaces RTK's `maxRetries` check, so the limit is enforced here.
  retryCondition: (error, _args, { attempt, baseQueryApi, extraOptions }) =>
    baseQueryApi.type === 'query' &&
    // extraOptions is undefined for calls made from inside a `queryFn`, despite its type.
    attempt <= ((extraOptions as typeof extraOptions | undefined)?.maxRetries ?? MAX_RETRIES) &&
    isTransient(error as ApiError),
});
