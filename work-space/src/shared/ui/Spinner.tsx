import { cn } from '@/shared/lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md';
  /** Accessible label; ignored when `decorative` is set. */
  label?: string;
  /** Hide from assistive tech when surrounding content already conveys the busy state. */
  decorative?: boolean;
  className?: string;
}

export function Spinner({
  size = 'md',
  label = 'Loading',
  decorative = false,
  className,
}: SpinnerProps) {
  const spinner = (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        size === 'sm' ? 'size-4' : 'size-6',
        className,
      )}
    />
  );

  if (decorative) return spinner;

  return (
    <span role="status" className="inline-flex items-center gap-2">
      {spinner}
      <span className="sr-only">{label}</span>
    </span>
  );
}
