/**
 * Large Export Utilities Tests
 * Tests for Web Worker-based large export handling
 * 
 * Requirements: 26.9, 26.10
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isLargeDataset,
  getEstimatedProcessingTime,
  isWebWorkerSupported,
  createBlobFromCSV,
  createBlobFromExcel,
  createBlobFromPDF,
  createBlob,
  createDownloadUrl,
  revokeDownloadUrl,
  downloadFromUrl,
} from '../largeExportUtils';

describe('Large Export Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isLargeDataset', () => {
    it('should return false for small datasets', () => {
      const smallData = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      expect(isLargeDataset(smallData)).toBe(false);
    });

    it('should return true for large datasets', () => {
      const largeData = Array.from({ length: 2000 }, (_, i) => ({ id: i }));
      expect(isLargeDataset(largeData)).toBe(true);
    });

    it('should return false for exactly 1000 items', () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      expect(isLargeDataset(data)).toBe(false);
    });

    it('should return true for 1001 items', () => {
      const data = Array.from({ length: 1001 }, (_, i) => ({ id: i }));
      expect(isLargeDataset(data)).toBe(true);
    });

    it('should return false for empty dataset', () => {
      expect(isLargeDataset([])).toBe(false);
    });
  });

  describe('getEstimatedProcessingTime', () => {
    it('should return correct estimate for small dataset', () => {
      const time = getEstimatedProcessingTime(100);
      expect(time).toBe(1);
    });

    it('should return correct estimate for large dataset', () => {
      const time = getEstimatedProcessingTime(10000);
      expect(time).toBe(100);
    });

    it('should return 1 for very small dataset', () => {
      const time = getEstimatedProcessingTime(50);
      expect(time).toBe(1);
    });

    it('should round up for non-divisible numbers', () => {
      const time = getEstimatedProcessingTime(150);
      expect(time).toBe(2);
    });
  });

  describe('isWebWorkerSupported', () => {
    it('should return true when Worker is defined', () => {
      expect(isWebWorkerSupported()).toBe(typeof Worker !== 'undefined');
    });
  });

  describe('Blob Creation', () => {
    const csvData = 'name,age\nJohn,30\nJane,25';

    describe('createBlobFromCSV', () => {
      it('should create CSV blob', () => {
        const blob = createBlobFromCSV(csvData);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/csv;charset=utf-8;');
      });

      it('should contain correct data', async () => {
        const blob = createBlobFromCSV(csvData);
        const text = await blob.text();
        expect(text).toBe(csvData);
      });
    });

    describe('createBlobFromExcel', () => {
      it('should create Excel blob', () => {
        const blob = createBlobFromExcel(csvData);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/vnd.ms-excel;charset=utf-8;');
      });
    });

    describe('createBlobFromPDF', () => {
      it('should create PDF blob', () => {
        const blob = createBlobFromPDF(csvData);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/csv;charset=utf-8;');
      });
    });

    describe('createBlob', () => {
      it('should create CSV blob for csv format', () => {
        const blob = createBlob(csvData, 'csv');
        expect(blob.type).toBe('text/csv;charset=utf-8;');
      });

      it('should create Excel blob for excel format', () => {
        const blob = createBlob(csvData, 'excel');
        expect(blob.type).toBe('application/vnd.ms-excel;charset=utf-8;');
      });

      it('should create PDF blob for pdf format', () => {
        const blob = createBlob(csvData, 'pdf');
        expect(blob.type).toBe('text/csv;charset=utf-8;');
      });

      it('should default to CSV for unknown format', () => {
        const blob = createBlob(csvData, 'csv');
        expect(blob.type).toBe('text/csv;charset=utf-8;');
      });
    });
  });

  describe('URL Management', () => {
    const mockBlob = new Blob(['test data']);

    describe('createDownloadUrl', () => {
      it('should create object URL', () => {
        const url = createDownloadUrl(mockBlob);
        expect(url).toMatch(/^blob:/);
      });

      it('should create different URLs for different blobs', () => {
        const blob1 = new Blob(['data1']);
        const blob2 = new Blob(['data2']);

        const url1 = createDownloadUrl(blob1);
        const url2 = createDownloadUrl(blob2);

        expect(url1).not.toBe(url2);

        // Cleanup
        revokeDownloadUrl(url1);
        revokeDownloadUrl(url2);
      });
    });

    describe('revokeDownloadUrl', () => {
      it('should revoke object URL', () => {
        const url = createDownloadUrl(mockBlob);
        expect(() => revokeDownloadUrl(url)).not.toThrow();
      });

      it('should handle multiple revocations', () => {
        const url = createDownloadUrl(mockBlob);
        revokeDownloadUrl(url);
        expect(() => revokeDownloadUrl(url)).not.toThrow();
      });
    });
  });

  describe('downloadFromUrl', () => {
    it('should create and click download link', () => {
      const mockUrl = 'blob:http://localhost/123';
      const mockFilename = 'test.csv';

      // Mock document methods
      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
      };

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = vi.spyOn(document, 'appendChild').mockReturnValue(mockLink as any);
      const removeChildSpy = vi.spyOn(document, 'removeChild').mockReturnValue(mockLink as any);

      downloadFromUrl(mockUrl, mockFilename);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', mockFilename);
      expect(mockLink.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
