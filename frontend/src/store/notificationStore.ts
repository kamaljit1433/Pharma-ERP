import { create } from 'zustand';
import notificationService, { Notification } from '../services/notificationService';

interface NotificationState {
  // Data
  notifications: Notification[];
  unreadCount: number;

  // WebSocket
  wsConnected: boolean;
  wsReconnecting: boolean;

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (limit?: number, offset?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  setWSConnected: (connected: boolean) => void;
  setWSReconnecting: (reconnecting: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  wsConnected: false,
  wsReconnecting: false,
  loading: false,
  error: null,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...initialState,

  // Fetch notifications
  fetchNotifications: async (limit = 50, offset = 0) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationService.getNotifications(limit, offset);
      set({
        notifications: response.data,
        unreadCount: response.pagination.unreadCount,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Mark as read
  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    const unreadIds = get().notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await notificationService.markMultipleAsRead(unreadIds);
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Add notification (from WebSocket)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  // WebSocket connection management
  connectWebSocket: () => {
    // WebSocket connection logic will be implemented in a separate hook
    set({ wsConnected: true, wsReconnecting: false });
  },

  disconnectWebSocket: () => {
    set({ wsConnected: false, wsReconnecting: false });
  },

  setWSConnected: (connected) => {
    set({ wsConnected: connected });
  },

  setWSReconnecting: (reconnecting) => {
    set({ wsReconnecting: reconnecting });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),
}));
