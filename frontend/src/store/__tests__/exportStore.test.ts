/**
 * Export Store Tests
 * Tests for managing export state and download tracking
 * 
 * Requirements: 26.9, 26.10
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExportStore } from '../exportStore';

describe('Export Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useExportStore());
    act(() => {
      result.current.jobs.forEach((job) => {
        result.current.removeJob(job.id);
      });
    });
  });

  describe('addJob', () => {
    it('should add a new job', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      expect(result.current.jobs).toHaveLength(1);
      expect(result.current.jobs[0].id).toBe(jobId);
      expect(result.current.jobs[0].filename).toBe('test.csv');
      expect(result.current.jobs[0].status).toBe('pending');
      expect(result.current.jobs[0].progress).toBe(0);
    });

    it('should set active job when adding', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      expect(result.current.activeJobId).toBe(jobId);
    });

    it('should generate unique IDs', () => {
      const { result } = renderHook(() => useExportStore());

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addJob({
          filename: 'test1.csv',
          format: 'csv',
          dataSize: 1000,
        });
        id2 = result.current.addJob({
          filename: 'test2.csv',
          format: 'csv',
          dataSize: 2000,
        });
      });

      expect(id1).not.toBe(id2);
    });

    it('should add new jobs to the beginning of the list', () => {
      const { result } = renderHook(() => useExportStore());

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addJob({
          filename: 'test1.csv',
          format: 'csv',
          dataSize: 1000,
        });
        id2 = result.current.addJob({
          filename: 'test2.csv',
          format: 'csv',
          dataSize: 2000,
        });
      });

      expect(result.current.jobs[0].id).toBe(id2);
      expect(result.current.jobs[1].id).toBe(id1);
    });
  });

  describe('updateJobProgress', () => {
    it('should update job progress', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      act(() => {
        result.current.updateJobProgress(jobId, 50);
      });

      expect(result.current.jobs[0].progress).toBe(50);
    });

    it('should set status to processing when progress > 0', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      act(() => {
        result.current.updateJobProgress(jobId, 50);
      });

      expect(result.current.jobs[0].status).toBe('processing');
    });

    it('should clamp progress between 0 and 100', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      act(() => {
        result.current.updateJobProgress(jobId, 150);
      });

      expect(result.current.jobs[0].progress).toBe(100);

      act(() => {
        result.current.updateJobProgress(jobId, -10);
      });

      expect(result.current.jobs[0].progress).toBe(0);
    });
  });

  describe('completeJob', () => {
    it('should mark job as completed', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      act(() => {
        result.current.completeJob(jobId, 'blob:http://localhost/123');
      });

      expect(result.current.jobs[0].status).toBe('completed');
      expect(result.current.jobs[0].progress).toBe(100);
      expect(result.current.jobs[0].downloadUrl).toBe('blob:http://localhost/123');
      expect(result.current.jobs[0].completedAt).toBeDefined();
    });
  });

  describe('failJob', () => {
    it('should mark job as failed', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      act(() => {
        result.current.failJob(jobId, 'Export failed');
      });

      expect(result.current.jobs[0].status).toBe('failed');
      expect(result.current.jobs[0].error).toBe('Export failed');
      expect(result.current.jobs[0].completedAt).toBeDefined();
    });
  });

  describe('cancelJob', () => {
    it('should mark job as cancelled', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      act(() => {
        result.current.cancelJob(jobId);
      });

      expect(result.current.jobs[0].status).toBe('cancelled');
      expect(result.current.jobs[0].completedAt).toBeDefined();
    });
  });

  describe('removeJob', () => {
    it('should remove job from list', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      expect(result.current.jobs).toHaveLength(1);

      act(() => {
        result.current.removeJob(jobId);
      });

      expect(result.current.jobs).toHaveLength(0);
    });

    it('should clear active job if removed', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      expect(result.current.activeJobId).toBe(jobId);

      act(() => {
        result.current.removeJob(jobId);
      });

      expect(result.current.activeJobId).toBeNull();
    });
  });

  describe('clearCompletedJobs', () => {
    it('should remove completed and failed jobs', () => {
      const { result } = renderHook(() => useExportStore());

      let id1: string, id2: string, id3: string;
      act(() => {
        id1 = result.current.addJob({
          filename: 'test1.csv',
          format: 'csv',
          dataSize: 1000,
        });
        id2 = result.current.addJob({
          filename: 'test2.csv',
          format: 'csv',
          dataSize: 2000,
        });
        id3 = result.current.addJob({
          filename: 'test3.csv',
          format: 'csv',
          dataSize: 3000,
        });
      });

      act(() => {
        result.current.completeJob(id1, 'blob:url1');
        result.current.failJob(id2, 'Error');
        result.current.updateJobProgress(id3, 50);
      });

      expect(result.current.jobs).toHaveLength(3);

      act(() => {
        result.current.clearCompletedJobs();
      });

      expect(result.current.jobs).toHaveLength(1);
      expect(result.current.jobs[0].id).toBe(id3);
    });
  });

  describe('setActiveJob', () => {
    it('should set active job', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      act(() => {
        result.current.setActiveJob(null);
      });

      expect(result.current.activeJobId).toBeNull();

      act(() => {
        result.current.setActiveJob(jobId);
      });

      expect(result.current.activeJobId).toBe(jobId);
    });
  });

  describe('getJob', () => {
    it('should retrieve job by ID', () => {
      const { result } = renderHook(() => useExportStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          filename: 'test.csv',
          format: 'csv',
          dataSize: 1000,
        });
      });

      const job = result.current.getJob(jobId);
      expect(job).toBeDefined();
      expect(job?.id).toBe(jobId);
      expect(job?.filename).toBe('test.csv');
    });

    it('should return undefined for non-existent job', () => {
      const { result } = renderHook(() => useExportStore());

      const job = result.current.getJob('non-existent');
      expect(job).toBeUndefined();
    });
  });
});
