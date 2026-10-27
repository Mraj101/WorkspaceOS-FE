import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  name: string;
}

/** `user: null` means the visitor is anonymous; it is a valid state, not an error. */
export interface Session {
  user: User | null;
}

export const loginSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }),
  password: z.string().min(8, { error: 'Password must be at least 8 characters.' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
