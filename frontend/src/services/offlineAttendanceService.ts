/**
 * Offline Attendance Service
 * Handles attendance marking when offline with sync when connection restored
 */

import {
  savePendingAttendance,
  getPendingAttendanceRecords,
  markAttendanceSynced,
  deleteAttendanceRecord,
  saveToOfflineCache,
  getFromOfflineCache,
} from '@/utils/offlineStorage';
import { postMessageToSW, requestBackgroundSync, isOnline } from '@/utils/pwaRegister';
import { attendanceService } from './attendanceService';

export interface OfflineAttendanceRecord {
  id?: number;
  employeeId: string;
  checkInTime: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  faceDetectionResult?: boolean;
  timestamp: number;
  synced: boolean;
}

/**
 * Mark attendance offline
 */
export async function markAttendanceOffline(
  employeeId: string,
  checkInTime: string,
  location?: { latitude: number; longitude: number },
  faceDetectionResult?: boolean
): Promise<number> {
  const record: OfflineAttendanceRecord = {
    employeeId,
    checkInTime,
    checkInLocation: location,
    faceDetectionResult,
    timestamp: Date.now(),
    synced: false,
  };

  const id = await savePendingAttendance(record);

  // Request background sync
  await requestBackgroundSync('sync-attendance');

  return id;
}

/**
 * Get pending attendance records
 */
export async function getPendingAttendance(): Promise<OfflineAttendanceRecord[]> {
  return await getPendingAttendanceRecords();
}

/**
 * Sync pending attendance records
 */
export async function syncPendingAttendance(): Promise<{
  synced: number;
  failed: number;
  errors: Array<{ id: number; error: string }>;
}> {
  const pending = await getPendingAttendance();
  const results = {
    synced: 0,
    failed: 0,
    errors: [] as Array<{ id: number; error: string }>,
  };

  for (const record of pending) {
    if (!record.id) continue;

    try {
      // Attempt to sync with server
      const response = await attendanceService.checkIn({
        employeeId: record.employeeId,
        checkInTime: record.checkInTime,
        location: record.checkInLocation,
        faceDetectionResult: record.faceDetectionResult,
      });

      if (response) {
        // Mark as synced
        await markAttendanceSynced(record.id);
        results.synced++;

        // Notify UI
        notifyAttendanceSynced(record.id);
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        id: record.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Retry failed attendance sync
 */
export async function retryFailedAttendance(recordId: number): Promise<boolean> {
  const pending = await getPendingAttendance();
  const record = pending.find((r) => r.id === recordId);

  if (!record) {
    return false;
  }

  try {
    const response = await attendanceService.checkIn({
      employeeId: record.employeeId,
      checkInTime: record.checkInTime,
      location: record.checkInLocation,
      faceDetectionResult: record.faceDetectionResult,
    });

    if (response) {
      await markAttendanceSynced(recordId);
      notifyAttendanceSynced(recordId);
      return true;
    }
  } catch (error) {
    console.error('Retry failed:', error);
  }

  return false;
}

/**
 * Delete pending attendance record
 */
export async function deletePendingAttendance(recordId: number): Promise<void> {
  await deleteAttendanceRecord(recordId);
}

/**
 * Cache attendance data for offline access
 */
export async function cacheAttendanceData(employeeId: string, data: any): Promise<void> {
  const cacheKey = `attendance-${employeeId}`;
  await saveToOfflineCache(cacheKey, data);
}

/**
 * Get cached attendance data
 */
export async function getCachedAttendanceData(employeeId: string): Promise<any | null> {
  const cacheKey = `attendance-${employeeId}`;
  return await getFromOfflineCache(cacheKey);
}

/**
 * Handle conflict resolution for offline data
 */
export async function resolveAttendanceConflict(
  localRecord: OfflineAttendanceRecord,
  serverRecord: any
): Promise<OfflineAttendanceRecord> {
  // Strategy: Server record takes precedence (last-write-wins)
  // But preserve local timestamp for audit trail
  return {
    ...localRecord,
    ...serverRecord,
    timestamp: Math.max(localRecord.timestamp, serverRecord.timestamp || 0),
  };
}

/**
 * Notify UI of attendance sync
 */
function notifyAttendanceSynced(recordId: number): void {
  postMessageToSW({
    type: 'ATTENDANCE_SYNCED',
    id: recordId,
  });

  // Also dispatch custom event for UI listeners
  window.dispatchEvent(
    new CustomEvent('attendance-synced', {
      detail: { id: recordId },
    })
  );
}

/**
 * Listen for attendance sync events
 */
export function onAttendanceSynced(callback: (recordId: number) => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.id);
  };

  window.addEventListener('attendance-synced', handler);

  return () => {
    window.removeEventListener('attendance-synced', handler);
  };
}

/**
 * Get offline attendance status
 */
export async function getOfflineAttendanceStatus(): Promise<{
  pending: number;
  synced: number;
  failed: number;
  isOnline: boolean;
}> {
  const pending = await getPendingAttendance();
  const pendingCount = pending.filter((r) => !r.synced).length;
  const syncedCount = pending.filter((r) => r.synced).length;

  return {
    pending: pendingCount,
    synced: syncedCount,
    failed: 0, // Could track failed separately if needed
    isOnline: isOnline(),
  };
}

/**
 * Clear all offline attendance data
 */
export async function clearOfflineAttendanceData(): Promise<void> {
  const pending = await getPendingAttendance();
  for (const record of pending) {
    if (record.id) {
      await deleteAttendanceRecord(record.id);
    }
  }
}
