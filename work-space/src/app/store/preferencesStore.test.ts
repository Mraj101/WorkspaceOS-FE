import { beforeEach, describe, expect, it } from 'vitest';
import { usePreferencesStore } from './preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.setState({ theme: 'system', sidebarCollapsed: false });
  });

  it('persists only the declared preference fields with a version', () => {
    usePreferencesStore.getState().setTheme('dark');
    usePreferencesStore.getState().toggleSidebar();

    const stored = JSON.parse(localStorage.getItem('workspace.preferences') ?? '{}') as unknown;
    expect(stored).toEqual({ state: { theme: 'dark', sidebarCollapsed: true }, version: 1 });
  });

  it('migrates v0 data to the current shape', async () => {
    localStorage.setItem(
      'workspace.preferences',
      JSON.stringify({ state: { darkMode: true }, version: 0 }),
    );
    await usePreferencesStore.persist.rehydrate();
    expect(usePreferencesStore.getState().theme).toBe('dark');
  });
});
