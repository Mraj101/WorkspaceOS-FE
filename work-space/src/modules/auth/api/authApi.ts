import { baseApi } from '@/services/api';
import type { LoginInput, Session, User } from '../types/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSession: build.query<Session, void>({
      // The backend answers 401 for anonymous visitors. Map that to `{ user: null }` so
      // "not signed in" is a normal state and other errors stay real errors.
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery('/auth/session');
        if (result.error?.status === 401) return { data: { user: null } };
        if (result.error) return { error: result.error };
        return { data: result.data as Session };
      },
      providesTags: ['Session'],
    }),

    login: build.mutation<User, LoginInput>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
      async onQueryStarted(_credentials, { dispatch, queryFulfilled }) {
        const { data: user } = await queryFulfilled.catch(() => ({ data: null }));
        if (user) void dispatch(authApi.util.upsertQueryData('getSession', undefined, { user }));
      },
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Drop every cached response so no previous user's data survives sign-out.
          dispatch(baseApi.util.resetApiState());
        } catch {
          // Error is surfaced to the caller through the mutation result.
        }
      },
    }),
  }),
});

export const { useGetSessionQuery, useLoginMutation, useLogoutMutation } = authApi;
