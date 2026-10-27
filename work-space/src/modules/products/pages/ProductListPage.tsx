import { useState } from 'react';
import { Link } from 'react-router';
import { getErrorMessage } from '@/shared/lib/apiError';
import {
  Alert,
  Button,
  buttonStyles,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Pagination,
  Spinner,
} from '@/shared/ui';
import { useDeleteProductMutation, useListProductsQuery } from '../api/productsApi';
import { ProductFilters } from '../components/ProductFilters';
import { ProductTable } from '../components/ProductTable';
import { useProductListParams } from '../hooks/useProductListParams';
import { productPaths } from '../paths';
import type { Product } from '../types/product';

export function ProductListPage() {
  const { params, setParams } = useProductListParams();
  const { data, error, isLoading, isFetching, refetch } = useListProductsQuery(params);

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleteProduct, deleteState] = useDeleteProductMutation();

  const isFiltered = Boolean(params.search || params.category);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteProduct(pendingDelete.id).unwrap();
      setPendingDelete(null);
      deleteState.reset();
    } catch {
      // Error stays visible inside the dialog via deleteState.error.
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        actions={
          <Link to={productPaths.create()} className={buttonStyles()}>
            New product
          </Link>
        }
      />

      <ProductFilters params={params} onChange={setParams} />

      {isLoading ? (
        <div className="py-12 text-center">
          <Spinner label="Loading products" />
        </div>
      ) : error && !data ? (
        <Alert
          title="Couldn't load products"
          action={
            <Button size="sm" variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      ) : !data || data.items.length === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No matching products"
            description="Try a different search term or category."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setParams({ search: '', category: undefined });
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No products yet"
            description="Create your first product to get started."
            action={
              <Link to={productPaths.create()} className={buttonStyles()}>
                New product
              </Link>
            }
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {error && <Alert tone="info">Showing cached results. {getErrorMessage(error)}</Alert>}
          <ProductTable
            products={data.items}
            isRefreshing={isFetching}
            onDelete={setPendingDelete}
          />
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            disabled={isFetching}
            onPageChange={(page) => {
              setParams({ page });
            }}
          />
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete product?"
        tone="danger"
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        description={
          <>
            <p>
              <strong>{pendingDelete?.name}</strong> will be permanently removed.
            </p>
            {deleteState.error && (
              <p role="alert" className="mt-2 text-danger">
                {getErrorMessage(deleteState.error)}
              </p>
            )}
          </>
        }
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          setPendingDelete(null);
          deleteState.reset();
        }}
      />
    </>
  );
}
