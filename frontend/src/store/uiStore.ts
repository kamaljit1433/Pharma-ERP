import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTheme, getSystemTheme, type Theme } from '@/utils/theme';

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  content?: React.ReactNode;
}

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  modals: Record<string, Modal>;
  openModal: (id: string, content?: React.ReactNode) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      // Requirement 24.5: Detect system theme preference on first load
      theme: getSystemTheme(),
      
      // Requirement 24.2: Use CSS variables for theme colors
      // Requirement 24.3: Apply theme consistently across all components
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      // Initialize theme on app load
      // Requirement 24.5: Detect system theme preference on first load
      initializeTheme: () => {
        const currentTheme = get().theme;
        applyTheme(currentTheme);
      },

      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Modals
      modals: {},
      openModal: (id, content) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [id]: { id, isOpen: true, content },
          },
        })),
      closeModal: (id) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [id]: { ...state.modals[id], isOpen: false },
          },
        })),
      isModalOpen: (id) => {
        const { modals } = get();
        return modals[id]?.isOpen ?? false;
      },

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: Toast = { ...toast, id };
        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove toast after duration
        const duration = toast.duration ?? 5000;
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'ui-storage',
      // Requirement 24.4: Persist theme preference in localStorage
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
