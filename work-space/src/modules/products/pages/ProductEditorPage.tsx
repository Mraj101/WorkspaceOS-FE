import { skipToken } from '@reduxjs/toolkit/query';
import { Link, useNavigate, useParams } from 'react-router';
import { getErrorMessage, isNotFound } from '@/shared/lib/apiError';
import { Alert, Button, buttonStyles, EmptyState, PageHeader, Spinner } from '@/shared/ui';
import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from '../api/productsApi';
import { ProductForm } from '../components/ProductForm';
import { productPaths } from '../paths';
import type { Product, ProductInput } from '../types/product';

const toFormValues = ({ name, description, category, price, stock }: Product): ProductInput => ({
  name,
  description,
  category,
  price,
  stock,
});

/** Handles both /products/new and /products/:productId/edit. */
export function ProductEditorPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEdit = productId !== undefined;

  const { data: product, error, isLoading, refetch } = useGetProductQuery(productId ?? skipToken);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const backToList = () => void navigate(productPaths.list());
  const title = isEdit ? 'Edit product' : 'New product';

  if (isEdit && isLoading) {
    return <Spinner label="Loading product" />;
  }

  if (isEdit && isNotFound(error)) {
    return (
      <>
        <PageHeader title="Product not found" />
        <EmptyState
          title="This product doesn't exist"
          description="It may have been deleted."
          action={
            <Link to={productPaths.list()} className={buttonStyles('secondary')}>
              Back to products
            </Link>
          }
        />
      </>
    );
  }

  if (isEdit && (error || !product)) {
    return (
      <>
        <PageHeader title={title} />
        <Alert
          title="Couldn't load this product"
          action={
            <Button size="sm" variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader title={title} description={product?.name} />
      <ProductForm
        // Remount when switching between products so defaults are re-applied.
        key={product?.id ?? 'new'}
        defaultValues={product && toFormValues(product)}
        submitLabel={isEdit ? 'Save changes' : 'Create product'}
        onCancel={backToList}
        onSubmit={async (values) => {
          if (isEdit) await updateProduct({ id: productId, changes: values }).unwrap();
          else await createProduct(values).unwrap();
          backToList();
        }}
      />
    </>
  );
}
