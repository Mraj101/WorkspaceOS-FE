import { delay, http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import type { LoginInput, User } from '../types/auth';

export const DEMO_CREDENTIALS = { email: 'demo@example.com', password: 'password123' } as const;

const demoUser: User = { id: 'u_1', email: DEMO_CREDENTIALS.email, name: 'Demo User' };
const STORAGE_KEY = 'mock.session';
const url = (path: string) => `${env.apiBaseUrl}${path}`;

// Stands in for the backend's HttpOnly session cookie. sessionStorage keeps the mock
// signed in across reloads during development.
const mockSession = {
  get: () => sessionStorage.getItem(STORAGE_KEY) === '1',
  set: (signedIn: boolean) => {
    if (signedIn) sessionStorage.setItem(STORAGE_KEY, '1');
    else sessionStorage.removeItem(STORAGE_KEY);
  },
};

export function setMockSignedIn(signedIn: boolean) {
  mockSession.set(signedIn);
}

export const authHandlers = [
  http.get(url('/auth/session'), async () => {
    await delay();
    if (!mockSession.get()) return HttpResponse.json({ message: 'Not signed in' }, { status: 401 });
    return HttpResponse.json({ user: demoUser });
  }),

  http.post(url('/auth/login'), async ({ request }) => {
    await delay();
    const body = (await request.json()) as LoginInput;
    if (body.email !== DEMO_CREDENTIALS.email || body.password !== DEMO_CREDENTIALS.password) {
      return HttpResponse.json(
        {
          message: `Invalid email or password. Try ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}.`,
        },
        { status: 401 },
      );
    }
    mockSession.set(true);
    return HttpResponse.json(demoUser);
  }),

  http.post(url('/auth/logout'), async () => {
    await delay();
    mockSession.set(false);
    return new HttpResponse(null, { status: 204 });
  }),
];
