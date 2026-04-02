import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { watchSystemTheme } from '@/utils/theme';

/**
 * Custom hook to initialize the theme system
 * 
 * Handles:
 * - Initial theme application on mount
 * - System theme preference detection
 * - Watching for system theme changes (optional)
 * 
 * Requirements: 24.2, 24.3, 24.4, 24.5, 24.7, 24.9
 */
export function useThemeInitialization(watchSystem: boolean = false) {
  const { initializeTheme, setTheme } = useUIStore();

  useEffect(() => {
    // Initialize theme on mount
    // Requirement 24.5: Detect system theme preference on first load
    initializeTheme();

    // Optionally watch for system theme changes
    if (watchSystem) {
      const cleanup = watchSystemTheme((systemTheme) => {
        // Only update if user hasn't explicitly set a preference
        // This respects user choice while staying in sync with system
        const stored = localStorage.getItem('ui-storage');
        if (!stored) {
          setTheme(systemTheme);
        }
      });

      return cleanup;
    }
    
    return undefined;
  }, [initializeTheme, setTheme, watchSystem]);
}
