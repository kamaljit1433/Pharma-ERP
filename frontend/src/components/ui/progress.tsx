import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Current progress value (0-100) */
  value?: number;
  /** Label for screen readers */
  label?: string;
  /** Whether to show percentage text */
  showPercentage?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, label, showPercentage = false, ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, value));
  const ariaLabel = label || `Progress: ${percentage}%`;

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        aria-label={ariaLabel}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {percentage}% complete
        </span>
      )}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
