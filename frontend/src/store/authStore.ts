import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: number | null;

  // Actions
  login: (email: string, password: string, mfaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiresAt: null,

      // Login action
      login: async (email, password, mfaToken) => {
        set({ isLoading: true, error: null });
        try {
          const credentials = mfaToken ? { email, password, mfaToken } : { email, password };
          const response = await authService.login(credentials);
          
          // Only set authenticated if MFA is not required
          if (!response.requiresMfa) {
            const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes from now
            set({
              user: response.user,
              isAuthenticated: true,
              sessionExpiresAt: expiresAt,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      // Validate persisted session on app startup
      validateSession: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          const expiresAt = Date.now() + 30 * 60 * 1000;
          set({
            user,
            isAuthenticated: true,
            sessionExpiresAt: expiresAt,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid or expired, clear auth state
          set({
            user: null,
            isAuthenticated: false,
            sessionExpiresAt: null,
            isLoading: false,
            error: 'Session expired. Please login again.',
          });
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear all sensitive data regardless of API response
          set({
            user: null,
            isAuthenticated: false,
            sessionExpiresAt: null,
            isLoading: false,
            error: null,
          });

          // Clear other stores' sensitive data
          // This will be handled by individual stores' reset methods
          // which should be called from the logout handler in the app
        }
      },

      // Refresh session action
      refreshSession: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        try {
          const response = await authService.refreshSession();
          const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes from now
          set({
            user: response.user,
            sessionExpiresAt: expiresAt,
          });
        } catch (error) {
          console.error('Session refresh error:', error);
          // If refresh fails, logout
          get().logout();
        }
      },

      // Update user action
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      // Clear error action
      clearError: () => set({ error: null }),

      // Set loading action
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);
