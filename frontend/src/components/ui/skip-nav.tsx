import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipNav Component
 * 
 * Provides skip navigation links for keyboard users to bypass repetitive content.
 * 
 * Requirements: 21.10
 */

export interface SkipNavProps {
  /** Target element ID to skip to */
  targetId?: string;
  /** Label for the skip link */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

export const SkipNav = React.forwardRef<HTMLAnchorElement, SkipNavProps>(
  ({ targetId = 'main-content', label = 'Skip to main content', className }, ref) => {
    return (
      <a
        ref={ref}
        href={`#${targetId}`}
        className={cn(
          'sr-only focus:not-sr-only',
          'fixed left-4 top-4 z-[9999]',
          'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
      >
        {label}
      </a>
    );
  }
);

SkipNav.displayName = 'SkipNav';

/**
 * SkipNavContent Component
 * 
 * Wrapper for main content that serves as the skip navigation target.
 */
export interface SkipNavContentProps {
  /** Element ID for skip navigation target */
  id?: string;
  /** Child elements */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const SkipNavContent: React.FC<SkipNavContentProps> = ({
  id = 'main-content',
  children,
  className,
}) => {
  return (
    <main id={id} className={className} tabIndex={-1}>
      {children}
    </main>
  );
};

export default SkipNav;
