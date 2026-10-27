import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { env } from '@/shared/config/env';
import { renderRoute } from '@/test/renderRoute';
import { resetProductsDb } from './mocks/handlers';
import { productsRoutes } from './routes';

const render = (path = '/products') => renderRoute(productsRoutes, { path });
const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

describe('ProductListPage', () => {
  it('renders the first page and paginates via the URL', async () => {
    const { user, router } = render();

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(rows()).toHaveLength(10);
    expect(screen.getByText('Showing 1–10 of 15')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(rows()).toHaveLength(5);
    });
    expect(router.state.location.search).toBe('?page=2');
  });

  it('filters by search term after debouncing and resets to page 1', async () => {
    const { user, router } = render('/products?page=2');
    await screen.findByRole('table');

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'keyboard');

    await waitFor(() => {
      expect(rows()).toHaveLength(1);
    });
    expect(screen.getByRole('link', { name: 'Mechanical Keyboard' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?search=keyboard');
  });

  it('shows a filtered empty state that can clear filters', async () => {
    const { user } = render('/products?search=nothing-matches');

    expect(await screen.findByText('No matching products')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
  });

  it('shows an empty state when there are no products at all', async () => {
    resetProductsDb([]);
    render();
    expect(await screen.findByText('No products yet')).toBeInTheDocument();
  });

  it('shows an error with retry when the request fails', async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/products`, () =>
        HttpResponse.json({ message: 'Database unavailable' }, { status: 400 }),
      ),
    );
    const { user } = render();

    expect(await screen.findByRole('alert')).toHaveTextContent('Database unavailable');

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('deletes a product after confirmation and refreshes the list', async () => {
    const { user } = render();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Delete Docking Station' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete product?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Docking Station' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Showing 1–10 of 14')).toBeInTheDocument();
  });
});

describe('ProductEditorPage', () => {
  it('validates and creates a product', async () => {
    const { user, router } = render('/products/new');

    await user.click(await screen.findByRole('button', { name: 'Create product' }));
    expect(await screen.findByText('Name must be at least 2 characters.')).toBeInTheDocument();
    expect(screen.getByText('Choose a category.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), 'Standing Desk');
    await user.selectOptions(screen.getByLabelText(/category/i), 'hardware');
    await user.clear(screen.getByLabelText(/price/i));
    await user.type(screen.getByLabelText(/price/i), '499.99');
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/products');
    });
    expect(await screen.findByRole('link', { name: 'Standing Desk' })).toBeInTheDocument();
  });

  it('maps server field errors onto the form', async () => {
    const { user } = render('/products/new');

    await user.type(await screen.findByLabelText(/name/i), 'usb-c hub');
    await user.selectOptions(screen.getByLabelText(/category/i), 'hardware');
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('A product with this name already exists.')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('loads and updates an existing product', async () => {
    const { user } = render('/products/p_1/edit');

    const name = await screen.findByLabelText(/name/i);
    expect(name).toHaveValue('Laptop Stand');

    await user.clear(name);
    await user.type(name, 'Laptop Stand v2');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('link', { name: 'Laptop Stand v2' })).toBeInTheDocument();
  });

  it('shows not-found for unknown products', async () => {
    render('/products/missing/edit');
    expect(await screen.findByRole('heading', { name: 'Product not found' })).toBeInTheDocument();
  });
});
