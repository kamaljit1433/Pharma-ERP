/**
 * useAuth Hook
 * Provides access to authentication state and actions
 */

import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    sessionExpiresAt,
    login,
    logout,
    refreshSession,
    updateUser,
    clearError,
    setLoading,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    sessionExpiresAt,
    login,
    logout,
    refreshSession,
    updateUser,
    clearError,
    setLoading,
  };
};
