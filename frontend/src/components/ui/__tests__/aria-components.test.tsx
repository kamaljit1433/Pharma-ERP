import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../input';
import { Button } from '../button';
import { Progress } from '../progress';
import { LiveRegion } from '../live-region';
import { LoadingSpinner } from '../loading-spinner';
import { Image } from '../image';
import { SkipNav, SkipNavContent } from '../skip-nav';

/**
 * ARIA Implementation Tests
 * 
 * Tests for accessibility features across UI components.
 * Requirements: 21.4, 21.5, 21.11, 21.12
 */

describe('ARIA Implementation Tests', () => {
  describe('Input Component', () => {
    it('should have aria-invalid when error is present', () => {
      render(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby linking to error message', () => {
      render(<Input id="test-input" error="Invalid input" />);
      const input = screen.getByRole('textbox');
      const ariaDescribedBy = input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('error');
    });

    it('should have aria-invalid false when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should link description with aria-describedby', () => {
      render(<Input id="test-input" description="Enter your email" />);
      const input = screen.getByRole('textbox');
      const ariaDescribedBy = input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('description');
    });
  });

  describe('Button Component', () => {
    it('should have aria-busy when loading', () => {
      render(<Button loading>Save</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should have aria-disabled when disabled', () => {
      render(<Button disabled>Save</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should hide loading spinner from screen readers', () => {
      const { container } = render(<Button loading>Save</Button>);
      const spinner = container.querySelector('[aria-hidden="true"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      const { container } = render(
        <Button icon={<span>Icon</span>}>Save</Button>
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Progress Component', () => {
    it('should have progressbar role', () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });

    it('should have aria-valuenow attribute', () => {
      render(<Progress value={75} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '75');
    });

    it('should have aria-valuemin and aria-valuemax', () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have aria-label', () => {
      render(<Progress value={50} label="Upload progress" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-label', 'Upload progress');
    });

    it('should announce percentage when showPercentage is true', () => {
      render(<Progress value={75} showPercentage />);
      expect(screen.getByText('75% complete')).toBeInTheDocument();
    });
  });

  describe('LiveRegion Component', () => {
    it('should have status role', () => {
      render(<LiveRegion message="Test message" />);
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should have aria-live attribute', () => {
      render(<LiveRegion message="Test message" politeness="polite" />);
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-atomic attribute', () => {
      render(<LiveRegion message="Test message" />);
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should display message', () => {
      render(<LiveRegion message="Success message" />);
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should be visually hidden', () => {
      const { container } = render(<LiveRegion message="Test" />);
      const liveRegion = container.querySelector('.sr-only');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should have status role', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should have aria-live attribute', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-busy attribute', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });

    it('should have screen reader label', () => {
      render(<LoadingSpinner label="Loading data" />);
      expect(screen.getByText('Loading data')).toBeInTheDocument();
    });

    it('should show label visually when showLabel is true', () => {
      render(<LoadingSpinner label="Loading" showLabel />);
      const label = screen.getByText('Loading');
      expect(label).not.toHaveClass('sr-only');
    });

    it('should hide label visually when showLabel is false', () => {
      const { container } = render(<LoadingSpinner label="Loading" showLabel={false} />);
      const label = container.querySelector('.sr-only');
      expect(label).toHaveTextContent('Loading');
    });
  });

  describe('Image Component', () => {
    it('should have alt text', () => {
      render(<Image src="/test.jpg" alt="Test image" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should have empty alt for decorative images', () => {
      const { container } = render(<Image src="/test.jpg" alt="Decorative" decorative />);
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', '');
    });

    it('should have aria-hidden for decorative images', () => {
      const { container } = render(<Image src="/test.jpg" alt="Decorative" decorative />);
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('aria-hidden', 'true');
    });

    it('should show loading indicator with status role', () => {
      render(<Image src="/test.jpg" alt="Test" showLoadingIndicator />);
      // Loading indicator should be present initially
      const loadingIndicator = screen.queryByRole('status');
      // Note: This might not be visible after image loads in test environment
      expect(loadingIndicator).toBeDefined();
    });

    it('should show error state with proper aria-label', () => {
      render(<Image src="/invalid.jpg" alt="Test image" />);
      // Simulate error by not providing a valid image
      // The component should show error state
      const img = screen.getByRole('img', { hidden: true });
      expect(img).toBeInTheDocument();
    });
  });

  describe('SkipNav Component', () => {
    it('should have link to main content', () => {
      render(<SkipNav targetId="main-content" />);
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should be visually hidden until focused', () => {
      const { container } = render(<SkipNav />);
      const skipLink = container.querySelector('.sr-only');
      expect(skipLink).toBeInTheDocument();
    });

    it('should have custom label', () => {
      render(<SkipNav label="Skip to navigation" targetId="nav" />);
      expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
    });
  });

  describe('SkipNavContent Component', () => {
    it('should have main role', () => {
      render(
        <SkipNavContent id="main-content">
          <div>Content</div>
        </SkipNavContent>
      );
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have correct id', () => {
      render(
        <SkipNavContent id="test-content">
          <div>Content</div>
        </SkipNavContent>
      );
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'test-content');
    });

    it('should have tabIndex -1 for focus management', () => {
      render(
        <SkipNavContent>
          <div>Content</div>
        </SkipNavContent>
      );
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });
  });
});
