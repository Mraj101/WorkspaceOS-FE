// Public API of the auth module. Anything not exported here is private to the module.
export { authRoutes } from './routes';
export { RequireAuth } from './components/RequireAuth';
export { SignOutButton } from './components/SignOutButton';
export { useSession, type SessionState } from './hooks/useSession';
export type { User } from './types/auth';
