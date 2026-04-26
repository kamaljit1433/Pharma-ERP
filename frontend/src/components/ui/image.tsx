import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Image Component with Accessibility Support
 * 
 * Enhanced image component that ensures proper alt text and loading states.
 * 
 * Requirements: 21.5
 */

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Alternative text for the image (required for accessibility) */
  alt: string;
  /** Fallback image URL if main image fails to load */
  fallbackSrc?: string;
  /** Whether the image is decorative (will use empty alt text) */
  decorative?: boolean;
  /** Loading state indicator */
  showLoadingIndicator?: boolean;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      alt,
      fallbackSrc,
      decorative = false,
      showLoadingIndicator = false,
      onError,
      onLoad,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [currentSrc, setCurrentSrc] = React.useState(props.src);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.(event);
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(false);
      } else {
        setHasError(true);
      }
      
      onError?.(event);
    };

    // Reset state when src changes
    React.useEffect(() => {
      setIsLoading(true);
      setHasError(false);
      setCurrentSrc(props.src);
    }, [props.src]);

    // Decorative images should have empty alt text
    const altText = decorative ? '' : alt;
    const ariaHidden = decorative ? 'true' : undefined;

    if (hasError && !fallbackSrc) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground',
            className
          )}
          role="img"
          aria-label={decorative ? undefined : `Failed to load image: ${alt}`}
        >
          <span className="text-sm">Image unavailable</span>
        </div>
      );
    }

    return (
      <div className={cn('relative', className)}>
        {showLoadingIndicator && isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-muted"
            role="status"
            aria-label="Loading image"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        <img
          ref={ref}
          src={currentSrc}
          alt={altText}
          aria-hidden={ariaHidden}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity',
            isLoading && showLoadingIndicator && 'opacity-0',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Image.displayName = 'Image';

export default Image;
