import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

interface PreferencesState {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleSidebar: () => void;
}

/**
 * User interface preferences shared by the app shell. Persisted because they are
 * explicitly user-chosen, non-sensitive, and expected to survive reloads.
 *
 * Versioning: bump `version` whenever the persisted shape changes and handle the old
 * shape in `migrate`. Only fields listed in `partialize` are written to storage.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      setTheme: (theme) => {
        set({ theme });
      },
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
    }),
    {
      name: 'workspace.preferences',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, sidebarCollapsed }) => ({ theme, sidebarCollapsed }),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        // v0 stored `darkMode: boolean` instead of a theme preference.
        if (version === 0 && typeof state.darkMode === 'boolean') {
          return { sidebarCollapsed: false, theme: state.darkMode ? 'dark' : 'light' };
        }
        return state;
      },
    },
  ),
);
