import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getErrorMessage, isApiError } from './apiError';

/**
 * Map a failed mutation onto a react-hook-form instance: backend field errors go to their
 * fields, anything else becomes a form-level `root.server` error.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: readonly Path<T>[],
) {
  const fieldErrors = isApiError(error) ? error.fieldErrors : undefined;
  let assigned = false;

  if (fieldErrors) {
    for (const field of knownFields) {
      const message = fieldErrors[field];
      if (message) {
        setError(field, { type: 'server', message });
        assigned = true;
      }
    }
  }

  if (!assigned) {
    setError('root.server', { type: 'server', message: getErrorMessage(error) });
  }
}
