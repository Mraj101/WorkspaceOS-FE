import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface FieldControlProps {
  id: string;
  'aria-invalid': boolean | undefined;
  'aria-describedby': string | undefined;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | undefined;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label + hint + error wiring for any form control. Guarantees every control has a
 * programmatic label and that hints/errors are announced via aria-describedby.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {' '}
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const controlStyles =
  'border-border bg-surface h-10 w-full rounded-md border px-3 text-sm aria-invalid:border-danger';

type FieldOwnProps = Omit<FieldProps, 'children' | 'className'> & { containerClassName?: string };

export function TextField({
  label,
  hint,
  error,
  required,
  containerClassName,
  className,
  ...inputProps
}: FieldOwnProps & ComponentProps<'input'>) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {(control) => (
        <input
          required={required}
          className={cn(controlStyles, className)}
          {...control}
          {...inputProps}
        />
      )}
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  containerClassName,
  className,
  ...textareaProps
}: FieldOwnProps & ComponentProps<'textarea'>) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {(control) => (
        <textarea
          required={required}
          className={cn(controlStyles, 'h-auto min-h-24 py-2', className)}
          {...control}
          {...textareaProps}
        />
      )}
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  containerClassName,
  className,
  children,
  ...selectProps
}: FieldOwnProps & ComponentProps<'select'>) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {(control) => (
        <select
          required={required}
          className={cn(controlStyles, className)}
          {...control}
          {...selectProps}
        >
          {children}
        </select>
      )}
    </Field>
  );
}
