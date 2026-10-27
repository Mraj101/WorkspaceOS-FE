import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { usePreferencesStore, type ThemePreference } from '@/app/store/preferencesStore';
import { SignOutButton, useSession } from '@/modules/auth';
import { APP_NAME } from '@/shared/constants/app';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';
import { primaryNav } from './navigation';

const MAIN_ID = 'main-content';

/** Authenticated application shell: skip link, header, collapsible sidebar, main landmark. */
export function AppLayout() {
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);
  const session = useSession();
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  // Move focus to the new page on client-side navigation, as a full page load would.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href={`#${MAIN_ID}`}
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>

      <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-surface px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={!sidebarCollapsed}
            aria-controls="primary-navigation"
            onClick={toggleSidebar}
          >
            <span aria-hidden="true">☰</span>
            <span className="sr-only">Toggle navigation</span>
          </Button>
          <span className="font-semibold">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSelect />
          {session.status === 'authenticated' && (
            <span className="hidden text-sm text-muted sm:inline">{session.user.name}</span>
          )}
          <SignOutButton />
        </div>
      </header>

      <div className="flex flex-1">
        <nav
          id="primary-navigation"
          aria-label="Primary"
          hidden={sidebarCollapsed}
          className="w-56 shrink-0 border-r border-border bg-surface p-3"
        >
          <ul className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm',
                      isActive
                        ? 'bg-surface-muted font-medium'
                        : 'text-muted hover:bg-surface-muted',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main id={MAIN_ID} ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 p-6 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ThemeSelect() {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Color theme</span>
      <select
        value={theme}
        onChange={(event) => {
          setTheme(event.target.value as ThemePreference);
        }}
        className="h-8 rounded-md border border-border bg-surface px-2"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
