import { useState, useCallback, useEffect } from 'react';
import {
  markAttendanceOffline,
  getPendingAttendance,
  syncPendingAttendance,
  getOfflineAttendanceStatus,
  onAttendanceSynced,
} from '@/services/offlineAttendanceService';
import { isOnline } from '@/utils/pwaRegister';

export interface UseOfflineAttendanceReturn {
  markOffline: (
    employeeId: string,
    checkInTime: string,
    location?: { latitude: number; longitude: number },
    faceDetectionResult?: boolean
  ) => Promise<number>;
  getPending: () => Promise<any[]>;
  sync: () => Promise<any>;
  status: {
    pending: number;
    synced: number;
    failed: number;
    isOnline: boolean;
  };
  loading: boolean;
  error: string | null;
}

export function useOfflineAttendance(): UseOfflineAttendanceReturn {
  const [status, setStatus] = useState({
    pending: 0,
    synced: 0,
    failed: 0,
    isOnline: isOnline(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load status on mount
  useEffect(() => {
    loadStatus();

    // Listen for sync events
    const unsubscribe = onAttendanceSynced(() => {
      loadStatus();
    });

    // Listen for online status changes
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const statusData = await getOfflineAttendanceStatus();
      setStatus(statusData);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load status';
      setError(message);
    }
  }, []);

  const markOffline = useCallback(
    async (
      employeeId: string,
      checkInTime: string,
      location?: { latitude: number; longitude: number },
      faceDetectionResult?: boolean
    ): Promise<number> => {
      setLoading(true);
      try {
        const id = await markAttendanceOffline(employeeId, checkInTime, location, faceDetectionResult);
        await loadStatus();
        setError(null);
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to mark attendance';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadStatus]
  );

  const getPending = useCallback(async () => {
    setLoading(true);
    try {
      const records = await getPendingAttendance();
      setError(null);
      return records;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get pending records';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    if (!isOnline()) {
      setError('Cannot sync while offline');
      return;
    }

    setLoading(true);
    try {
      const result = await syncPendingAttendance();
      await loadStatus();
      setError(null);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync attendance';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  return {
    markOffline,
    getPending,
    sync,
    status,
    loading,
    error,
  };
}
