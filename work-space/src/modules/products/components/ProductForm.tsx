import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { applyServerErrors } from '@/shared/lib/forms';
import { Alert, Button, SelectField, TextAreaField, TextField } from '@/shared/ui';
import { PRODUCT_CATEGORIES, productFormSchema, type ProductInput } from '../types/product';
import { categoryLabel } from '../utils/format';

const FIELDS = ['name', 'description', 'category', 'price', 'stock'] as const;

interface ProductFormProps {
  defaultValues?: ProductInput | undefined;
  submitLabel: string;
  /** Should resolve on success and throw (e.g. RTK `unwrap()`) on failure. */
  onSubmit: (values: ProductInput) => Promise<unknown>;
  onCancel: () => void;
}

/** Presentation + validation only. Callers decide which mutation runs and where to go next. */
export function ProductForm({ defaultValues, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? { name: '', description: '', price: 0, stock: 0 },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError, FIELDS);
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-surface p-6"
    >
      {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}
      <TextField label="Name" required error={errors.name?.message} {...register('name')} />
      <TextAreaField
        label="Description"
        hint="Optional. Up to 500 characters."
        error={errors.description?.message}
        {...register('description')}
      />
      <SelectField
        label="Category"
        required
        error={errors.category?.message}
        {...register('category')}
      >
        <option value="">Select a category</option>
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </SelectField>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Price (USD)"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          required
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
        <TextField
          label="Stock"
          type="number"
          inputMode="numeric"
          step="1"
          min={0}
          required
          error={errors.stock?.message}
          {...register('stock', { valueAsNumber: true })}
        />
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
