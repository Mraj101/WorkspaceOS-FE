import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '@/services/api';
import { sessionExpiryListener } from './sessionExpiryListener';

/**
 * Redux exists to host the RTK Query cache. Add a slice here only for client state that
 * genuinely belongs in Redux (rare); shared UI state goes in Zustand, local state in React.
 */
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Factory so tests get an isolated store; the app uses the singleton below. */
export function makeStore(preloadedState?: Partial<RootState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(sessionExpiryListener.middleware).concat(baseApi.middleware),
  });
  setupListeners(store.dispatch);
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = makeStore();
