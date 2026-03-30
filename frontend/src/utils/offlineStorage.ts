/**
 * IndexedDB Offline Storage Management
 */

const DB_NAME = 'ems-offline';
const DB_VERSION = 1;

export interface OfflineRecord {
  id?: number;
  key: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initializeOfflineStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains('pending-attendance')) {
        const store = database.createObjectStore('pending-attendance', { keyPath: 'id', autoIncrement: true });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!database.objectStoreNames.contains('offline-cache')) {
        const store = database.createObjectStore('offline-cache', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!database.objectStoreNames.contains('sync-queue')) {
        const store = database.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Get database instance
 */
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    db = await initializeOfflineStorage();
  }
  return db;
}

/**
 * Save pending attendance record
 */
export async function savePendingAttendance(data: any): Promise<number> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['pending-attendance'], 'readwrite');
    const store = transaction.objectStore('pending-attendance');
    const request = store.add({
      data,
      timestamp: Date.now(),
      synced: false,
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

/**
 * Get all pending attendance records
 */
export async function getPendingAttendanceRecords(): Promise<OfflineRecord[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['pending-attendance'], 'readonly');
    const store = transaction.objectStore('pending-attendance');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const records = request.result.filter((r: any) => !r.synced);
      resolve(records);
    };
  });
}

/**
 * Mark attendance record as synced
 */
export async function markAttendanceSynced(id: number): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['pending-attendance'], 'readwrite');
    const store = transaction.objectStore('pending-attendance');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const record = request.result;
      if (record) {
        record.synced = true;
        const updateRequest = store.put(record);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
  });
}

/**
 * Delete attendance record
 */
export async function deleteAttendanceRecord(id: number): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['pending-attendance'], 'readwrite');
    const store = transaction.objectStore('pending-attendance');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all pending attendance records
 */
export async function clearPendingAttendance(): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['pending-attendance'], 'readwrite');
    const store = transaction.objectStore('pending-attendance');
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Save data to offline cache
 */
export async function saveToOfflineCache(key: string, data: any): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['offline-cache'], 'readwrite');
    const store = transaction.objectStore('offline-cache');
    const request = store.put({
      key,
      data,
      timestamp: Date.now(),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get data from offline cache
 */
export async function getFromOfflineCache(key: string): Promise<any | null> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['offline-cache'], 'readonly');
    const store = transaction.objectStore('offline-cache');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const record = request.result;
      resolve(record ? record.data : null);
    };
  });
}

/**
 * Delete from offline cache
 */
export async function deleteFromOfflineCache(key: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['offline-cache'], 'readwrite');
    const store = transaction.objectStore('offline-cache');
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all offline cache
 */
export async function clearOfflineCache(): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['offline-cache'], 'readwrite');
    const store = transaction.objectStore('offline-cache');
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Add item to sync queue
 */
export async function addToSyncQueue(key: string, data: any): Promise<number> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');
    const request = store.add({
      key,
      data,
      timestamp: Date.now(),
      synced: false,
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

/**
 * Get all items in sync queue
 */
export async function getSyncQueue(): Promise<OfflineRecord[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['sync-queue'], 'readonly');
    const store = transaction.objectStore('sync-queue');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const records = request.result.filter((r: any) => !r.synced);
      resolve(records);
    };
  });
}

/**
 * Mark sync queue item as synced
 */
export async function markSyncQueueItemSynced(id: number): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const record = request.result;
      if (record) {
        record.synced = true;
        const updateRequest = store.put(record);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
  });
}

/**
 * Delete from sync queue
 */
export async function deleteFromSyncQueue(id: number): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get database size
 */
export async function getOfflineStorageSize(): Promise<{ usage: number; quota: number }> {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
    return { usage: 0, quota: 0 };
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  } catch (error) {
    console.error('Failed to get storage estimate:', error);
    return { usage: 0, quota: 0 };
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) {
    return false;
  }

  try {
    return await navigator.storage.persist();
  } catch (error) {
    console.error('Failed to request persistent storage:', error);
    return false;
  }
}
