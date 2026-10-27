import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-fg hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'text-fg hover:bg-surface-muted',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

/** Shared so links that look like buttons (e.g. router <Link>) stay visually consistent. */
export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
  );
}
