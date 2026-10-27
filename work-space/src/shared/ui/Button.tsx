import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles';
import { Spinner } from './Spinner';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the button and shows a spinner; use while a submission is in flight. */
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(buttonStyles(variant, size), className)}
      {...props}
    >
      {isLoading && <Spinner size="sm" decorative />}
      {children}
    </button>
  );
}
