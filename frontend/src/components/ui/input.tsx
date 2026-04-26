import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display and announce to screen readers */
  error?: string;
  /** Description text for additional context */
  description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, description, ...props }, ref) => {
    const inputId = props.id || React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const descriptionId = description ? `${inputId}-description` : undefined;

    const ariaDescribedBy = [descriptionId, errorId]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
