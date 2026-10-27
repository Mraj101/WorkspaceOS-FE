import { z } from 'zod';

// Single source of truth for build-time configuration. Validated once at startup so a
// misconfigured deployment fails loudly instead of producing confusing runtime errors.
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  enableMocks: parsed.data.VITE_ENABLE_MOCKS,
  isDev: import.meta.env.DEV,
} as const;
