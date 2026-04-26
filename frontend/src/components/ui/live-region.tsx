import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * LiveRegion Component
 * 
 * ARIA live region for announcing dynamic content changes to screen readers.
 * Used for toast notifications, loading states, and other dynamic updates.
 * 
 * Requirements: 21.11, 21.12
 */

export interface LiveRegionProps {
  /** The message to announce */
  message: string;
  /** Politeness level for announcements */
  politeness?: 'polite' | 'assertive' | 'off';
  /** Whether to clear the message after announcement */
  clearOnAnnounce?: boolean;
  /** Delay before clearing (ms) */
  clearDelay?: number;
  /** Additional CSS classes */
  className?: string;
}

export const LiveRegion = React.forwardRef<HTMLDivElement, LiveRegionProps>(
  (
    {
      message,
      politeness = 'polite',
      clearOnAnnounce = true,
      clearDelay = 1000,
      className,
    },
    ref
  ) => {
    const [currentMessage, setCurrentMessage] = React.useState(message);

    React.useEffect(() => {
      if (message) {
        setCurrentMessage(message);

        if (clearOnAnnounce) {
          const timer = setTimeout(() => {
            setCurrentMessage('');
          }, clearDelay);

          return () => clearTimeout(timer);
        }
      }
    }, [message, clearOnAnnounce, clearDelay]);

    return (
      <div
        ref={ref}
        role="status"
        aria-live={politeness}
        aria-atomic="true"
        className={cn('sr-only', className)}
      >
        {currentMessage}
      </div>
    );
  }
);

LiveRegion.displayName = 'LiveRegion';

/**
 * Hook for managing live region announcements
 */
export const useLiveRegion = () => {
  const [message, setMessage] = React.useState('');
  const [politeness, setPoliteness] = React.useState<'polite' | 'assertive'>('polite');

  const announce = React.useCallback(
    (text: string, level: 'polite' | 'assertive' = 'polite') => {
      setPoliteness(level);
      setMessage(text);
    },
    []
  );

  const clear = React.useCallback(() => {
    setMessage('');
  }, []);

  return {
    message,
    politeness,
    announce,
    clear,
  };
};

export { LiveRegion as default };
