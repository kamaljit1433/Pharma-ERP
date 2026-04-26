import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

/**
 * Hook to validate and initialize authentication on app startup
 * - Initializes tokens from localStorage
 * - Validates persisted auth state against the backend
 * - Clears invalid/expired tokens
 * - Prevents infinite redirect loops
 */
export const useAuthInitialization = () => {
  const { isAuthenticated, validateSession } = useAuthStore();
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    // Only validate once on app startup
    if (hasValidatedRef.current) return;
    hasValidatedRef.current = true;

    // Initialize tokens from localStorage
    authService.initializeTokens();

    // If user is marked as authenticated, validate the session
    if (isAuthenticated) {
      console.log('Validating persisted auth session...');
      validateSession().catch((error) => {
        console.error('Session validation failed:', error);
      });
    }
  }, []); // Empty dependency array - run only once on mount
};
