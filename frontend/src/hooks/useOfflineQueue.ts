import { useState, useEffect, useCallback } from 'react';
import {
  queueOperation,
  getQueueSize,
  hasPendingOperations,
  processOfflineQueue,
  QueuedOperation,
} from '@/utils/offlineQueue';
import { isOnline } from '@/utils/pwaRegister';

interface UseOfflineQueueReturn {
  queueSize: number;
  hasPending: boolean;
  isOnline: boolean;
  queueWrite: (operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>) => Promise<string>;
  syncQueue: () => Promise<{ success: number; failed: number }>;
  refreshQueueStatus: () => Promise<void>;
}

/**
 * Hook for managing offline queue operations
 */
export function useOfflineQueue(
  apiClient?: (endpoint: string, method: string, data?: any) => Promise<any>
): UseOfflineQueueReturn {
  const [queueSize, setQueueSize] = useState(0);
  const [hasPending, setHasPending] = useState(false);
  const [online, setOnline] = useState(isOnline());

  // Refresh queue status
  const refreshQueueStatus = useCallback(async () => {
    try {
      const size = await getQueueSize();
      const pending = await hasPendingOperations();
      setQueueSize(size);
      setHasPending(pending);
    } catch (error) {
      console.error('Failed to refresh queue status:', error);
    }
  }, []);

  // Queue a write operation
  const queueWrite = useCallback(
    async (operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>) => {
      try {
        const id = await queueOperation(operation);
        await refreshQueueStatus();
        return id;
      } catch (error) {
        console.error('Failed to queue operation:', error);
        throw error;
      }
    },
    [refreshQueueStatus]
  );

  // Sync queued operations
  const syncQueue = useCallback(async () => {
    if (!apiClient) {
      throw new Error('API client not provided');
    }

    try {
      const result = await processOfflineQueue(apiClient);
      await refreshQueueStatus();
      return result;
    } catch (error) {
      console.error('Failed to sync queue:', error);
      throw error;
    }
  }, [apiClient, refreshQueueStatus]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      refreshQueueStatus();
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    refreshQueueStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshQueueStatus]);

  return {
    queueSize,
    hasPending,
    isOnline: online,
    queueWrite,
    syncQueue,
    refreshQueueStatus,
  };
}
