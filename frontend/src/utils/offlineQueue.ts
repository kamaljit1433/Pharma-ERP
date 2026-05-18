/**
 * Offline Queue for Write Operations
 * Queues write operations when offline and syncs them when back online
 */

export interface QueuedOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  timestamp: number;
  retryCount: number;
}

const DB_NAME = 'ems-offline';
const DB_VERSION = 1;
const STORE_NAME = 'offline-queue';
const MAX_RETRIES = 3;

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB for offline queue
 */
export async function initOfflineQueue(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create offline queue store
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('endpoint', 'endpoint', { unique: false });
      }
    };
  });
}

/**
 * Get database instance
 */
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    await initOfflineQueue();
  }
  return db!;
}

/**
 * Add operation to offline queue
 */
export async function queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
  const database = await getDB();
  
  const queuedOp: QueuedOperation = {
    ...operation,
    id: generateId(),
    timestamp: Date.now(),
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(queuedOp);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('Operation queued:', queuedOp);
      resolve(queuedOp.id);
    };
  });
}

/**
 * Get all queued operations
 */
export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Remove operation from queue
 */
export async function removeQueuedOperation(id: string): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('Operation removed from queue:', id);
      resolve();
    };
  });
}

/**
 * Update operation retry count
 */
export async function updateOperationRetryCount(id: string, retryCount: number): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const operation = getRequest.result;
      if (operation) {
        operation.retryCount = retryCount;
        const updateRequest = store.put(operation);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
  });
}

/**
 * Process offline queue - sync all pending operations
 */
export async function processOfflineQueue(
  apiClient: (endpoint: string, method: string, data?: any) => Promise<any>
): Promise<{ success: number; failed: number }> {
  const operations = await getQueuedOperations();
  let success = 0;
  let failed = 0;

  for (const operation of operations) {
    try {
      // Attempt to sync the operation
      await apiClient(operation.endpoint, operation.method, operation.data);
      
      // Remove from queue on success
      await removeQueuedOperation(operation.id);
      success++;
      
      console.log('Operation synced successfully:', operation.id);
    } catch (error) {
      console.error('Failed to sync operation:', operation.id, error);
      
      // Increment retry count
      const newRetryCount = operation.retryCount + 1;
      
      if (newRetryCount >= MAX_RETRIES) {
        // Permanently drop after max retries — only count these as failed
        await removeQueuedOperation(operation.id);
        failed++;
        console.warn('Operation removed after max retries:', operation.id);
      } else {
        // Keep in queue for the next sync cycle — not a failure yet
        await updateOperationRetryCount(operation.id, newRetryCount);
      }
    }
  }

  return { success, failed };
}

/**
 * Clear all queued operations
 */
export async function clearOfflineQueue(): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('Offline queue cleared');
      resolve();
    };
  });
}

/**
 * Get queue size
 */
export async function getQueueSize(): Promise<number> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Check if there are pending operations
 */
export async function hasPendingOperations(): Promise<boolean> {
  const size = await getQueueSize();
  return size > 0;
}

/**
 * Generate unique ID for operations
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Listen for online event and auto-sync
 */
export function setupAutoSync(
  apiClient: (endpoint: string, method: string, data?: any) => Promise<any>,
  onSyncComplete?: (result: { success: number; failed: number }) => void
): () => void {
  const handleOnline = async () => {
    console.log('Back online - processing offline queue');
    
    try {
      const result = await processOfflineQueue(apiClient);
      console.log('Offline queue processed:', result);
      onSyncComplete?.(result);
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  };

  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
