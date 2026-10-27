import { z } from 'zod';
import type { PageParams } from '@/shared/types/api';

export const PRODUCT_CATEGORIES = ['hardware', 'software', 'services'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_SORTS = ['updatedAt:desc', 'name:asc', 'price:asc', 'price:desc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  updatedAt: string;
}

export interface ProductListParams extends PageParams {
  search: string;
  category?: ProductCategory | undefined;
  sort: ProductSort;
}

/** Validation shared by create and edit. Numbers arrive via `valueAsNumber` (NaN when empty). */
export const productFormSchema = z.object({
  name: z.string().trim().min(2, { error: 'Name must be at least 2 characters.' }).max(80),
  description: z.string().trim().max(500, { error: 'Keep the description under 500 characters.' }),
  category: z.enum(PRODUCT_CATEGORIES, { error: 'Choose a category.' }),
  price: z
    .number({ error: 'Enter a price.' })
    .min(0, { error: 'Price cannot be negative.' })
    .multipleOf(0.01, { error: 'Use at most two decimals.' }),
  stock: z
    .number({ error: 'Enter a stock quantity.' })
    .int({ error: 'Stock must be a whole number.' })
    .min(0, { error: 'Stock cannot be negative.' }),
});

export type ProductInput = z.infer<typeof productFormSchema>;
