import { Navigate, type RouteObject } from 'react-router';
import { AppLayout } from '@/app/layouts/AppLayout';
import { authRoutes, RequireAuth } from '@/modules/auth';
import { productPaths, productsRoutes } from '@/modules/products';
import { Spinner } from '@/shared/ui';
import { NotFoundPage } from './NotFoundPage';
import { RouteErrorPage } from './RouteErrorPage';

/**
 * Route composition. Modules own their route definitions and pages; the app only decides
 * where each module's routes are mounted (public vs. authenticated shell).
 */
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    ),
    children: [
      ...authRoutes,
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            // Errors inside a page keep the shell (and navigation) usable.
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, element: <Navigate to={productPaths.list()} replace /> },
              ...productsRoutes,
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];
