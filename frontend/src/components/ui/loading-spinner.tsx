import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * LoadingSpinner Component
 * 
 * Accessible loading spinner with proper ARIA attributes.
 * 
 * Requirements: 21.11, 21.12
 */

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Label for screen readers */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the label visually */
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', label = 'Loading', className, showLabel = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center gap-2', className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className={cn(
            'animate-spin rounded-full border-primary border-t-transparent',
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
        {showLabel ? (
          <span className="text-sm text-muted-foreground">{label}</span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Inline loading spinner for buttons and small spaces
 */
export const InlineSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn('h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default LoadingSpinner;
