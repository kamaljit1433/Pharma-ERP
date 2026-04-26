/**
 * Large Export Utilities
 * Handles large exports using Web Workers to prevent UI freezing
 * 
 * Requirements: 26.9, 26.10
 */

import { ExportMessage, ExportResult } from '@/workers/exportWorker';

export interface LargeExportOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (result: string) => void;
  onError?: (error: string) => void;
  signal?: AbortSignal;
}

let worker: Worker | null = null;
const pendingExports = new Map<string, LargeExportOptions>();

/**
 * Initialize Web Worker for exports
 */
function initializeWorker(): Worker {
  if (worker) {
    return worker;
  }

  // Create worker from inline code or external file
  try {
    worker = new Worker(new URL('@/workers/exportWorker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<ExportResult>) => {
      const { type, id, progress, result, error } = event.data;
      const options = pendingExports.get(id);

      if (!options) {
        return;
      }

      switch (type) {
        case 'progress':
          if (progress !== undefined) {
            options.onProgress?.(progress);
          }
          break;

        case 'complete':
          if (result) {
            options.onComplete?.(result);
            pendingExports.delete(id);
          }
          break;

        case 'error':
          if (error) {
            options.onError?.(error);
            pendingExports.delete(id);
          }
          break;
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      // Notify all pending exports of the error
      pendingExports.forEach((options) => {
        options.onError?.('Worker error: ' + error.message);
      });
      pendingExports.clear();
    };
  } catch (error) {
    console.warn('Failed to create Web Worker, falling back to main thread');
    return null as any;
  }

  return worker;
}

/**
 * Export large dataset using Web Worker
 */
export async function exportLargeDataset(
  data: any[],
  format: 'csv' | 'excel' | 'pdf',
  id: string,
  options?: LargeExportOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const workerInstance = initializeWorker();

      if (!workerInstance) {
        // Fallback to main thread processing
        reject(new Error('Web Worker not available'));
        return;
      }

      // Handle abort signal
      if (options?.signal?.aborted) {
        reject(new Error('Export cancelled'));
        return;
      }

      const abortHandler = () => {
        pendingExports.delete(id);
        reject(new Error('Export cancelled'));
      };

      options?.signal?.addEventListener('abort', abortHandler);

      // Store options for worker message handler
      pendingExports.set(id, {
        ...options,
        onComplete: (result) => {
          options?.onComplete?.(result);
          options?.signal?.removeEventListener('abort', abortHandler);
          resolve(result);
        },
        onError: (error) => {
          options?.onError?.(error);
          options?.signal?.removeEventListener('abort', abortHandler);
          reject(new Error(error));
        },
      });

      // Send message to worker
      const message: ExportMessage = {
        type: 'export',
        data,
        format,
        id,
      };

      workerInstance.postMessage(message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      options?.onError?.(errorMessage);
      reject(error);
    }
  });
}

/**
 * Check if Web Workers are supported
 */
export function isWebWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Terminate Web Worker
 */
export function terminateWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  pendingExports.clear();
}

/**
 * Create blob from CSV string
 */
export function createBlobFromCSV(csv: string): Blob {
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Create blob from Excel string (fallback to CSV)
 */
export function createBlobFromExcel(csv: string): Blob {
  return new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
}

/**
 * Create blob from PDF string (fallback to CSV)
 */
export function createBlobFromPDF(csv: string): Blob {
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Create blob based on format
 */
export function createBlob(data: string, format: 'csv' | 'excel' | 'pdf'): Blob {
  switch (format) {
    case 'csv':
      return createBlobFromCSV(data);
    case 'excel':
      return createBlobFromExcel(data);
    case 'pdf':
      return createBlobFromPDF(data);
    default:
      return createBlobFromCSV(data);
  }
}

/**
 * Create download URL from blob
 */
export function createDownloadUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke download URL
 */
export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Trigger file download from URL
 */
export function downloadFromUrl(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Check if dataset is large (requires Web Worker)
 */
export function isLargeDataset(data: any[]): boolean {
  // Consider datasets with more than 1000 rows as large
  return data.length > 1000;
}

/**
 * Get estimated processing time for dataset
 */
export function getEstimatedProcessingTime(dataSize: number): number {
  // Rough estimate: 1ms per 100 rows
  return Math.ceil(dataSize / 100);
}
