import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RequireAuth } from './components/RequireAuth';
import { DEMO_CREDENTIALS, setMockSignedIn } from './mocks/handlers';
import { authRoutes } from './routes';
import { renderRoute } from '@/test/renderRoute';

const routes = [
  ...authRoutes,
  { element: <RequireAuth />, children: [{ path: '/secret', element: <h1>Secret page</h1> }] },
];

describe('auth flow', () => {
  it('redirects anonymous users to sign-in and returns them after login', async () => {
    const { user, router } = renderRoute(routes, { path: '/secret' });

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?redirectTo=%2Fsecret');

    await user.type(screen.getByLabelText(/email/i), DEMO_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/password/i), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Secret page' })).toBeInTheDocument();
  });

  it('validates input before calling the API', async () => {
    const { user } = renderRoute(routes, { path: '/login' });

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/email/i)).toHaveAccessibleDescription(
      'Enter a valid email address.',
    );
  });

  it('shows the server error for wrong credentials', async () => {
    const { user } = renderRoute(routes, { path: '/login' });

    await user.type(await screen.findByLabelText(/email/i), 'someone@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i);
  });

  it('lets signed-in users through', async () => {
    setMockSignedIn(true);
    renderRoute(routes, { path: '/secret' });
    expect(await screen.findByRole('heading', { name: 'Secret page' })).toBeInTheDocument();
  });
});
