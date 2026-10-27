import { createListenerMiddleware, isRejectedWithValue } from '@reduxjs/toolkit';
import { baseApi } from '@/services/api';
import { isApiError } from '@/shared/lib/apiError';

/**
 * When any request fails with 401, the session may no longer be valid. Invalidating the
 * Session tag refetches the session query; if the session really expired, the app flips to
 * "anonymous" and the route guard redirects to sign-in. Modules never handle 401 themselves.
 * (The session query maps its own 401 to `{ user: null }`, so this cannot loop.)
 */
export const sessionExpiryListener = createListenerMiddleware();

sessionExpiryListener.startListening({
  predicate: (action) =>
    isRejectedWithValue(action) && isApiError(action.payload) && action.payload.status === 401,
  effect: (_action, api) => {
    api.dispatch(baseApi.util.invalidateTags(['Session']));
  },
});
