import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { makeStore } from '@/app/store/store';

// The data router takes ownership of route objects (it resolves and strips `lazy` in place),
// so each test router needs its own copy of the module-level route definitions.
function cloneRoutes(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => ({
    ...route,
    ...(route.lazy && { lazy: typeof route.lazy === 'function' ? route.lazy : { ...route.lazy } }),
    ...(route.children && { children: cloneRoutes(route.children) }),
  })) as RouteObject[];
}

interface RenderRouteOptions {
  /** Initial URL, e.g. "/products?page=2". */
  path?: string;
}

/**
 * Render routes with a fresh store and an in-memory router: the same composition as the
 * real app, minus the browser. Returns the store and router for assertions.
 */
export function renderRoute(routes: RouteObject[], { path = '/' }: RenderRouteOptions = {}) {
  const store = makeStore();
  const router = createMemoryRouter(cloneRoutes(routes), { initialEntries: [path] });
  const user = userEvent.setup();

  const result = render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );

  return { ...result, store, router, user };
}
