import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { applyTheme } from '@/app/providers/useThemeSync';
import { routes } from '@/app/router/routes';
import { store } from '@/app/store/store';
import { usePreferencesStore } from '@/app/store/preferencesStore';
import { env } from '@/shared/config/env';
import '@/styles/globals.css';

async function enableMocking() {
  // `import.meta.env.DEV` is statically replaced, so mocks are tree-shaken from production.
  if (!import.meta.env.DEV || !env.enableMocks) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
}

// Apply the persisted theme before first paint to avoid a flash of the wrong theme.
applyTheme(usePreferencesStore.getState().theme);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

await enableMocking();

const router = createBrowserRouter(routes);

createRoot(rootElement).render(
  <AppProviders store={store}>
    <RouterProvider router={router} />
  </AppProviders>,
);
