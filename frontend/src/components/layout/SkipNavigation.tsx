import React from 'react';

/**
 * SkipNavigation Component
 * 
 * Provides skip navigation links for keyboard users to bypass repetitive navigation.
 * The links are visually hidden but become visible when focused with keyboard.
 * 
 * Requirements:
 * - 21.10: Provide skip navigation links
 * - 21.1: Keyboard navigation for all interactive elements
 * - 21.3: Visible focus indicators
 * 
 * @example
 * ```tsx
 * <SkipNavigation />
 * ```
 */
export const SkipNavigation: React.FC = () => {
  return (
    <div className="skip-navigation-container">
      <a
        href="#main-content"
        className="skip-nav"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-nav"
        aria-label="Skip to navigation"
      >
        Skip to navigation
      </a>
    </div>
  );
};

export default SkipNavigation;
