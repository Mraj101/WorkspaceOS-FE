import type { RouteObject } from 'react-router';
import { LOGIN_PATH } from './utils/redirect';

/** Public routes owned by the auth module. Pages are lazy-loaded into their own chunks. */
export const authRoutes: RouteObject[] = [
  {
    path: LOGIN_PATH,
    lazy: { Component: async () => (await import('./pages/LoginPage')).LoginPage },
  },
];
