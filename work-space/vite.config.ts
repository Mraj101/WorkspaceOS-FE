import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Optional dev proxy so the browser can call a real backend same-origin
  // (cookies, no CORS). Not prefixed with VITE_, so it never reaches the bundle.
  const proxyTarget = env.API_PROXY_TARGET;

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Serves /mockServiceWorker.js in dev only; never emitted into production builds.
      { ...msw({ mode: 'worker-only' }), apply: 'serve' },
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 3000,
      proxy: proxyTarget ? { '/api': { target: proxyTarget, changeOrigin: true } } : undefined,
    },
    build: { sourcemap: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
      env: { VITE_API_BASE_URL: 'http://localhost/api', VITE_ENABLE_MOCKS: 'false' },
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/mocks/**', 'src/main.tsx'],
      },
    },
  };
});
