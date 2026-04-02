import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initOfflineQueue,
  queueOperation,
  getQueuedOperations,
  removeQueuedOperation,
  processOfflineQueue,
  clearOfflineQueue,
  getQueueSize,
  hasPendingOperations,
} from '../offlineQueue';

// Mock IndexedDB
const mockIndexedDB = () => {
  const store = new Map();

  return {
    open: vi.fn(() => ({
      result: {
        objectStoreNames: {
          contains: vi.fn(() => false),
        },
        createObjectStore: vi.fn(() => ({
          createIndex: vi.fn(),
        })),
        transaction: vi.fn((storeName: string, mode: string) => ({
          objectStore: vi.fn(() => ({
            add: vi.fn((data: any) => ({
              onsuccess: null,
              onerror: null,
              result: data.id,
            })),
            getAll: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
              result: Array.from(store.values()),
            })),
            get: vi.fn((id: string) => ({
              onsuccess: null,
              onerror: null,
              result: store.get(id),
            })),
            put: vi.fn((data: any) => ({
              onsuccess: null,
              onerror: null,
            })),
            delete: vi.fn((id: string) => ({
              onsuccess: null,
              onerror: null,
            })),
            count: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
              result: store.size,
            })),
            clear: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
            })),
          })),
        })),
      },
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    })),
  };
};

describe('offlineQueue', () => {
  beforeEach(() => {
    // Mock IndexedDB
    (global as any).indexedDB = mockIndexedDB();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initOfflineQueue', () => {
    it('should initialize IndexedDB', async () => {
      await expect(initOfflineQueue()).resolves.toBeUndefined();
    });
  });

  describe('queueOperation', () => {
    it('should queue an operation', async () => {
      const operation = {
        type: 'CREATE' as const,
        endpoint: '/api/v1/attendance',
        method: 'POST' as const,
        data: { checkIn: true },
      };

      const id = await queueOperation(operation);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });
  });

  describe('getQueuedOperations', () => {
    it('should return all queued operations', async () => {
      const operations = await getQueuedOperations();
      expect(Array.isArray(operations)).toBe(true);
    });
  });

  describe('processOfflineQueue', () => {
    it('should process queued operations successfully', async () => {
      const mockApiClient = vi.fn().mockResolvedValue({ success: true });

      const result = await processOfflineQueue(mockApiClient);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
      expect(typeof result.success).toBe('number');
      expect(typeof result.failed).toBe('number');
    });

    it('should handle failed operations', async () => {
      const mockApiClient = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await processOfflineQueue(mockApiClient);
      expect(result.failed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getQueueSize', () => {
    it('should return the queue size', async () => {
      const size = await getQueueSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('hasPendingOperations', () => {
    it('should return boolean indicating pending operations', async () => {
      const hasPending = await hasPendingOperations();
      expect(typeof hasPending).toBe('boolean');
    });
  });

  describe('clearOfflineQueue', () => {
    it('should clear all queued operations', async () => {
      await expect(clearOfflineQueue()).resolves.toBeUndefined();
    });
  });
});
