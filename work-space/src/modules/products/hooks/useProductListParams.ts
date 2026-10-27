import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/shared/constants/app';
import { PRODUCT_CATEGORIES, PRODUCT_SORTS, type ProductListParams } from '../types/product';

// The URL is the source of truth for list state: shareable, bookmarkable, back-button safe.
// Invalid or tampered values fall back to defaults instead of breaking the page.
const paramsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce
    .number()
    .refine((size) => (PAGE_SIZE_OPTIONS as readonly number[]).includes(size))
    .catch(DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(100).catch(''),
  category: z.enum(PRODUCT_CATEGORIES).optional().catch(undefined),
  sort: z.enum(PRODUCT_SORTS).catch('updatedAt:desc'),
});

const DEFAULTS = paramsSchema.parse({});

export function useProductListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: ProductListParams = useMemo(
    () => paramsSchema.parse(Object.fromEntries(searchParams)),
    [searchParams],
  );

  /** Merge changes into the URL. Changing any filter resets to page 1. Defaults are omitted. */
  const setParams = useCallback(
    (changes: Partial<ProductListParams>) => {
      setSearchParams(
        (current) => {
          const next: ProductListParams = {
            ...paramsSchema.parse(Object.fromEntries(current)),
            ...changes,
          };
          if (!('page' in changes)) next.page = 1;

          const query = new URLSearchParams();
          for (const [key, value] of Object.entries(next)) {
            if (
              value !== undefined &&
              value !== '' &&
              value !== DEFAULTS[key as keyof ProductListParams]
            ) {
              query.set(key, String(value));
            }
          }
          return query;
        },
        // Filter typing shouldn't flood history; page changes should be navigable.
        { replace: !('page' in changes) },
      );
    },
    [setSearchParams],
  );

  return { params, setParams };
}
