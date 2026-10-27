import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface AlertProps {
  tone?: 'danger' | 'info';
  title?: string;
  children?: ReactNode;
  /** Optional recovery action, e.g. a retry button. */
  action?: ReactNode;
  className?: string;
}

export function Alert({ tone = 'danger', title, children, action, className }: AlertProps) {
  return (
    <div
      // role="alert" interrupts screen readers; reserve it for errors.
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 rounded-md border p-4 text-sm',
        tone === 'danger'
          ? 'border-danger/40 bg-danger-surface text-danger'
          : 'border-border bg-surface-muted text-fg',
        className,
      )}
    >
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-1')}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
