import { Button } from './Button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Disable navigation while the next page is loading to avoid racing requests. */
  disabled?: boolean;
}

export function Pagination({ page, pageSize, total, onPageChange, disabled }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted" aria-live="polite">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          Previous
        </Button>
        <span className="text-sm" aria-current="page">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || page >= pageCount}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
