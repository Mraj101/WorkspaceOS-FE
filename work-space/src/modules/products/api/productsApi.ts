import { baseApi, LIST_ID } from '@/services/api';
import type { Paginated } from '@/shared/types/api';
import type { Product, ProductInput, ProductListParams } from '../types/product';

/**
 * Tag strategy:
 * - listProducts provides one tag per returned item plus `{ id: 'LIST' }`.
 * - updateProduct invalidates only `{ id }`: every list containing that item refetches.
 * - createProduct / deleteProduct invalidate `LIST`, since membership and totals change.
 */
export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listProducts: build.query<Paginated<Product>, ProductListParams>({
      query: ({ page, pageSize, search, category, sort }) => ({
        url: '/products',
        params: { page, pageSize, sort, ...(search && { search }), ...(category && { category }) },
      }),
      providesTags: (result) => [
        ...(result?.items.map(({ id }) => ({ type: 'Product' as const, id })) ?? []),
        { type: 'Product', id: LIST_ID },
      ],
    }),

    getProduct: build.query<Product, string>({
      query: (id) => `/products/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    createProduct: build.mutation<Product, ProductInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: LIST_ID }],
    }),

    updateProduct: build.mutation<Product, { id: string; changes: ProductInput }>({
      query: ({ id, changes }) => ({
        url: `/products/${encodeURIComponent(id)}`,
        method: 'PUT',
        body: changes,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/products/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: LIST_ID },
      ],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
