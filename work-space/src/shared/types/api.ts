/**
 * Normalized error shape for every request made through the shared API.
 * Components and hooks only ever handle this type, never raw fetch errors.
 */
export interface ApiError {
  /** HTTP status code, or a client-side failure category. */
  status: number | 'NETWORK_ERROR' | 'TIMEOUT' | 'PARSE_ERROR' | 'UNKNOWN';
  /** Human-readable message safe to show to the user. */
  message: string;
  /** Machine-readable error code from the backend, when provided. */
  code?: string;
  /** Per-field validation errors from the backend, keyed by field name. */
  fieldErrors?: Record<string, string>;
}

/** Envelope used by all paginated list endpoints. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PageParams {
  page: number;
  pageSize: number;
}
