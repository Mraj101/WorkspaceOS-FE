import { useEffect } from 'react';
import { usePreferencesStore, type ThemePreference } from '@/app/store/preferencesStore';

const darkQuery = '(prefers-color-scheme: dark)';

export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  return window.matchMedia(darkQuery).matches ? 'dark' : 'light';
}

export function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.theme = resolveTheme(preference);
}

/** Keeps <html data-theme> in sync with the stored preference and the OS setting. */
export function useThemeSync() {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;

    const media = window.matchMedia(darkQuery);
    const onChange = () => {
      applyTheme('system');
    };
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, [theme]);
}
