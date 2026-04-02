/**
 * Theme Utility
 * 
 * Handles theme detection, initialization, and management.
 * Requirements: 24.2, 24.5, 24.7, 24.8, 24.9
 */

export type Theme = 'light' | 'dark';

/**
 * Detects the system's preferred color scheme
 * Requirement 24.5: Detect system theme preference on first load
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Gets the stored theme preference from localStorage
 * Falls back to system preference if no stored preference exists
 * Requirement 24.4: Persist theme preference in localStorage
 * Requirement 24.5: Detect system theme preference on first load
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('ui-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.theme === 'light' || parsed.state?.theme === 'dark') {
        return parsed.state.theme;
      }
    } catch (error) {
      console.error('Failed to parse stored theme:', error);
    }
  }
  
  // If no stored preference, use system preference
  return getSystemTheme();
}

/**
 * Applies the theme to the document root
 * Requirement 24.2: Use CSS variables for theme colors
 * Requirement 24.3: Apply theme consistently across all components
 * Requirement 24.7: Animate theme transitions smoothly
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove both classes first
  root.classList.remove('light', 'dark');
  
  // Add the new theme class
  root.classList.add(theme);
  
  // Update meta theme-color for mobile browsers
  // Requirement 24.9: Update meta theme-color for mobile browsers
  updateMetaThemeColor(theme);
}

/**
 * Updates the meta theme-color tag for mobile browsers
 * Requirement 24.9: Update meta theme-color for mobile browsers
 */
export function updateMetaThemeColor(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  if (metaThemeColor) {
    // Light mode: white (#ffffff), Dark mode: near black (#0a0a0a)
    const color = theme === 'dark' ? '#0a0a0a' : '#ffffff';
    metaThemeColor.setAttribute('content', color);
  }
}

/**
 * Initializes the theme system on app load
 * Requirement 24.5: Detect system theme preference on first load
 */
export function initializeTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Listens for system theme changes and returns a cleanup function
 * Requirement 24.5: Detect system theme preference on first load
 */
export function watchSystemTheme(callback: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    const theme = e.matches ? 'dark' : 'light';
    callback(theme);
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  
  // Fallback for older browsers
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
  
  return () => {};
}

/**
 * Validates theme color contrast for accessibility
 * Requirement 24.8: Ensure text readability in both themes
 */
export function validateThemeContrast(): boolean {
  // This is a placeholder for future contrast validation
  // In production, you might want to use a library like 'color-contrast-checker'
  // to validate WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
  return true;
}
