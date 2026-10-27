import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';
import { productPaths } from '../paths';
import type { Product } from '../types/product';
import { categoryLabel, formatDate, formatPrice } from '../utils/format';

interface ProductTableProps {
  products: Product[];
  /** True while a newer page/filter result is loading; stale rows stay visible but dimmed. */
  isRefreshing: boolean;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, isRefreshing, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table
        aria-busy={isRefreshing}
        className={cn('w-full text-left text-sm transition-opacity', isRefreshing && 'opacity-60')}
      >
        <caption className="sr-only">Products</caption>
        <thead className="bg-surface-muted text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Stock
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Updated
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {products.map((product) => (
            <tr key={product.id}>
              <th scope="row" className="px-4 py-3 font-medium">
                <Link to={productPaths.edit(product.id)} className="hover:underline">
                  {product.name}
                </Link>
              </th>
              <td className="px-4 py-3">{categoryLabel(product.category)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatPrice(product.price)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{product.stock}</td>
              <td className="px-4 py-3 text-muted">{formatDate(product.updatedAt)}</td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDelete(product);
                  }}
                  aria-label={`Delete ${product.name}`}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
