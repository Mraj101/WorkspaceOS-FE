import { StrictMode, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import type { AppStore } from '@/app/store/store';
import { useThemeSync } from './useThemeSync';

interface AppProvidersProps {
  store: AppStore;
  children: ReactNode;
}

function ThemeSync() {
  useThemeSync();
  return null;
}

/** Global providers only. Feature-specific context belongs inside the owning module. */
export function AppProviders({ store, children }: AppProvidersProps) {
  return (
    <StrictMode>
      <ReduxProvider store={store}>
        <ThemeSync />
        {children}
      </ReduxProvider>
    </StrictMode>
  );
}
