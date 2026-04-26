/**
 * Export Store
 * Manages export state and download tracking
 * 
 * Requirements: 26.9, 26.10
 */

import { create } from 'zustand';

export interface ExportJob {
  id: string;
  filename: string;
  format: 'csv' | 'excel' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  error?: string;
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  dataSize: number;
}

export interface ExportStoreState {
  jobs: ExportJob[];
  activeJobId: string | null;

  // Actions
  addJob: (job: Omit<ExportJob, 'id' | 'createdAt' | 'progress' | 'status'>) => string;
  updateJobProgress: (id: string, progress: number) => void;
  completeJob: (id: string, downloadUrl: string) => void;
  failJob: (id: string, error: string) => void;
  cancelJob: (id: string) => void;
  removeJob: (id: string) => void;
  clearCompletedJobs: () => void;
  setActiveJob: (id: string | null) => void;
  getJob: (id: string) => ExportJob | undefined;
}

export const useExportStore = create<ExportStoreState>((set, get) => ({
  jobs: [],
  activeJobId: null,

  addJob: (job) => {
    const id = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newJob: ExportJob = {
      ...job,
      id,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    set((state) => ({
      jobs: [newJob, ...state.jobs],
      activeJobId: id,
    }));

    return id;
  },

  updateJobProgress: (id, progress) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              progress: Math.min(100, Math.max(0, progress)),
              status: progress > 0 && progress < 100 ? 'processing' : job.status,
            }
          : job
      ),
    }));
  },

  completeJob: (id, downloadUrl) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              status: 'completed',
              progress: 100,
              downloadUrl,
              completedAt: new Date(),
            }
          : job
      ),
    }));
  },

  failJob: (id, error) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              status: 'failed',
              error,
              completedAt: new Date(),
            }
          : job
      ),
    }));
  },

  cancelJob: (id) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              status: 'cancelled',
              completedAt: new Date(),
            }
          : job
      ),
    }));
  },

  removeJob: (id) => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
      activeJobId: state.activeJobId === id ? null : state.activeJobId,
    }));
  },

  clearCompletedJobs: () => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.status !== 'completed' && job.status !== 'failed'),
    }));
  },

  setActiveJob: (id) => {
    set({ activeJobId: id });
  },

  getJob: (id) => {
    return get().jobs.find((job) => job.id === id);
  },
}));
