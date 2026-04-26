/**
 * Download Manager Tests
 * Tests for managing and displaying export downloads
 * 
 * Requirements: 26.9, 26.10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DownloadManager } from '../DownloadManager';
import { useExportStore } from '@/store/exportStore';

// Mock the export store
vi.mock('@/store/exportStore', () => ({
  useExportStore: vi.fn(),
}));

// Mock the large export utils
vi.mock('@/utils/largeExportUtils', () => ({
  revokeDownloadUrl: vi.fn(),
}));

describe('DownloadManager', () => {
  const mockJobs = [
    {
      id: 'job-1',
      filename: 'employees.csv',
      format: 'csv' as const,
      status: 'completed' as const,
      progress: 100,
      downloadUrl: 'blob:http://localhost/123',
      createdAt: new Date(),
      dataSize: 1000,
    },
    {
      id: 'job-2',
      filename: 'attendance.csv',
      format: 'csv' as const,
      status: 'processing' as const,
      progress: 50,
      createdAt: new Date(),
      dataSize: 5000,
    },
    {
      id: 'job-3',
      filename: 'payroll.csv',
      format: 'csv' as const,
      status: 'failed' as const,
      progress: 0,
      error: 'Export failed',
      createdAt: new Date(),
      dataSize: 2000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Download Manager')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    const { container } = render(
      <DownloadManager
        open={false}
        onOpenChange={vi.fn()}
      />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should display active downloads section', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Active Downloads')).toBeInTheDocument();
    expect(screen.getByText('attendance.csv')).toBeInTheDocument();
  });

  it('should display completed downloads section', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Completed Downloads')).toBeInTheDocument();
    expect(screen.getByText('employees.csv')).toBeInTheDocument();
  });

  it('should show progress for processing jobs', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should show error message for failed jobs', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Export failed')).toBeInTheDocument();
  });

  it('should show status badges', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should display download button for completed jobs', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const downloadButtons = screen.getAllByRole('button', { name: /Download/ });
    expect(downloadButtons.length).toBeGreaterThan(0);
  });

  it('should call removeJob when delete button clicked', async () => {
    const user = userEvent.setup();
    const removeJob = vi.fn();

    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob,
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    // Find the delete button for the first job
    await user.click(deleteButtons[0]);

    expect(removeJob).toHaveBeenCalled();
  });

  it('should call clearCompletedJobs when Clear All clicked', async () => {
    const user = userEvent.setup();
    const clearCompletedJobs = vi.fn();

    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs,
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const clearButton = screen.getByRole('button', { name: /Clear All/ });
    await user.click(clearButton);

    expect(clearCompletedJobs).toHaveBeenCalled();
  });

  it('should show empty state when no jobs', () => {
    (useExportStore as any).mockReturnValue({
      jobs: [],
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('No downloads yet')).toBeInTheDocument();
    expect(screen.getByText('Your exports will appear here')).toBeInTheDocument();
  });

  it('should display file metadata', () => {
    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    // Check for format display
    expect(screen.getByText('CSV')).toBeInTheDocument();
    // Check for size display (1000 bytes = 0.98 KB)
    expect(screen.getByText(/KB/)).toBeInTheDocument();
  });

  it('should handle download click', async () => {
    const user = userEvent.setup();

    (useExportStore as any).mockReturnValue({
      jobs: mockJobs,
      removeJob: vi.fn(),
      clearCompletedJobs: vi.fn(),
    });

    render(
      <DownloadManager
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const downloadButtons = screen.getAllByRole('button', { name: /Download/ });
    await user.click(downloadButtons[0]);

    // Download should be triggered (we can't fully test this without mocking document.createElement)
  });
});
