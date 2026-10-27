import { useEffect, useEffectEvent, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { SelectField, TextField } from '@/shared/ui';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SORTS,
  type ProductCategory,
  type ProductListParams,
  type ProductSort,
} from '../types/product';
import { categoryLabel } from '../utils/format';

const SORT_LABELS: Record<ProductSort, string> = {
  'updatedAt:desc': 'Recently updated',
  'name:asc': 'Name (A–Z)',
  'price:asc': 'Price (low to high)',
  'price:desc': 'Price (high to low)',
};

interface ProductFiltersProps {
  params: ProductListParams;
  onChange: (changes: Partial<ProductListParams>) => void;
}

export function ProductFilters({ params, onChange }: ProductFiltersProps) {
  // Typing is local and debounced; only the settled value reaches the URL and the API.
  const [search, setSearch] = useState(params.search);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // Follow external URL changes (back button, "Clear filters") into the input.
  const [urlSearch, setUrlSearch] = useState(params.search);
  if (params.search !== urlSearch) {
    setUrlSearch(params.search);
    if (params.search !== search.trim()) setSearch(params.search);
  }

  // Push only when the *debounced input* changes, never because the URL changed.
  const pushSearch = useEffectEvent((value: string) => {
    if (value !== params.search) onChange({ search: value });
  });
  useEffect(() => {
    pushSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <search className="mb-4 grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
      <TextField
        label="Search"
        type="search"
        placeholder="Search by name"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
      />
      <SelectField
        label="Category"
        value={params.category ?? ''}
        onChange={(event) => {
          onChange({ category: (event.target.value || undefined) as ProductCategory | undefined });
        }}
      >
        <option value="">All categories</option>
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Sort by"
        value={params.sort}
        onChange={(event) => {
          onChange({ sort: event.target.value as ProductSort });
        }}
      >
        {PRODUCT_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </option>
        ))}
      </SelectField>
    </search>
  );
}
