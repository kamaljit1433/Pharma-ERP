import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipNavigation } from '../SkipNavigation';

/**
 * Unit tests for SkipNavigation component
 * 
 * Requirements tested:
 * - 21.10: Provide skip navigation links
 * - 21.1: Keyboard navigation for all interactive elements
 * - 21.3: Visible focus indicators
 */
describe('SkipNavigation', () => {
  describe('Rendering', () => {
    it('should render skip navigation links', () => {
      render(<SkipNavigation />);
      
      const skipToMainLink = screen.getByText('Skip to main content');
      const skipToNavLink = screen.getByText('Skip to navigation');
      
      expect(skipToMainLink).toBeInTheDocument();
      expect(skipToNavLink).toBeInTheDocument();
    });

    it('should render links with correct href attributes', () => {
      render(<SkipNavigation />);
      
      const skipToMainLink = screen.getByText('Skip to main content');
      const skipToNavLink = screen.getByText('Skip to navigation');
      
      expect(skipToMainLink).toHaveAttribute('href', '#main-content');
      expect(skipToNavLink).toHaveAttribute('href', '#navigation');
    });

    it('should render links with aria-label attributes', () => {
      render(<SkipNavigation />);
      
      const skipToMainLink = screen.getByLabelText('Skip to main content');
      const skipToNavLink = screen.getByLabelText('Skip to navigation');
      
      expect(skipToMainLink).toBeInTheDocument();
      expect(skipToNavLink).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply skip-nav class to links', () => {
      render(<SkipNavigation />);
      
      const skipToMainLink = screen.getByText('Skip to main content');
      const skipToNavLink = screen.getByText('Skip to navigation');
      
      expect(skipToMainLink).toHaveClass('skip-nav');
      expect(skipToNavLink).toHaveClass('skip-nav');
    });
  });

  describe('Accessibility', () => {
    it('should have proper link semantics', () => {
      render(<SkipNavigation />);
      
      const links = screen.getAllByRole('link');
      
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAccessibleName('Skip to main content');
      expect(links[1]).toHaveAccessibleName('Skip to navigation');
    });

    it('should be keyboard accessible', () => {
      render(<SkipNavigation />);
      
      const skipToMainLink = screen.getByText('Skip to main content');
      
      // Links should be focusable
      expect(skipToMainLink).toHaveAttribute('href');
      expect(skipToMainLink.tagName).toBe('A');
    });
  });

  describe('Tab Order', () => {
    it('should render links in correct order', () => {
      render(<SkipNavigation />);
      
      const links = screen.getAllByRole('link');
      
      // First link should be "Skip to main content"
      expect(links[0]).toHaveTextContent('Skip to main content');
      
      // Second link should be "Skip to navigation"
      expect(links[1]).toHaveTextContent('Skip to navigation');
    });
  });
});
