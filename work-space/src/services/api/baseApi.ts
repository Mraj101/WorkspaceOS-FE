import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

/**
 * The single RTK Query API for the main backend. It defines no endpoints: each business
 * module adds its own with `baseApi.injectEndpoints` in `modules/<name>/api/`.
 *
 * Cache tags: one tag type per domain entity. Use `{ type, id }` for single entities and
 * `{ type, id: 'LIST' }` for collections, so a mutation can invalidate exactly what it affects.
 * Register a new tag type here when a new module introduces a new entity.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Session', 'Product'],
  endpoints: () => ({}),
  // Refetch stale data when the user returns to the tab or the network reconnects.
  // Requires `setupListeners(store.dispatch)`, called in app/store.
  refetchOnFocus: true,
  refetchOnReconnect: true,
  // Keep unused cache entries for 60s so back/forward navigation renders instantly.
  keepUnusedDataFor: 60,
});

export const LIST_ID = 'LIST' as const;
