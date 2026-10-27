import type { RouteObject } from 'react-router';

const editor = async () => (await import('./pages/ProductEditorPage')).ProductEditorPage;

/** Authenticated routes owned by the products module; mounted inside the app shell. */
export const productsRoutes: RouteObject[] = [
  {
    path: 'products',
    children: [
      {
        index: true,
        lazy: { Component: async () => (await import('./pages/ProductListPage')).ProductListPage },
      },
      { path: 'new', lazy: { Component: editor } },
      { path: ':productId/edit', lazy: { Component: editor } },
    ],
  },
];
