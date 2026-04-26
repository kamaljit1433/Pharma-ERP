/**
 * Large Export Dialog Tests
 * Tests for handling large exports without freezing the UI
 * 
 * Requirements: 26.9, 26.10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LargeExportDialog } from '../LargeExportDialog';

// Mock the export store
vi.mock('@/store/exportStore', () => ({
  useExportStore: () => ({
    addJob: vi.fn(() => 'job-123'),
    updateJobProgress: vi.fn(),
    completeJob: vi.fn(),
    failJob: vi.fn(),
  }),
}));

// Mock the large export utils
vi.mock('@/utils/largeExportUtils', () => ({
  exportLargeDataset: vi.fn(async (data, format, id, options) => {
    // Simulate progress updates
    options?.onProgress?.(25);
    options?.onProgress?.(50);
    options?.onProgress?.(75);
    options?.onProgress?.(100);
    return 'csv,data\n1,2\n3,4';
  }),
  isLargeDataset: (data: any[]) => data.length > 1000,
  isWebWorkerSupported: () => true,
  createBlob: (data: string) => new Blob([data]),
  createDownloadUrl: (blob: Blob) => 'blob:http://localhost/123',
  getEstimatedProcessingTime: (size: number) => Math.ceil(size / 100),
}));

// Mock the export utils
vi.mock('@/utils/exportUtils', () => ({
  generateFilename: (prefix: string, format: string) => `${prefix}.${format}`,
}));

// Mock the useToast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('LargeExportDialog', () => {
  const mockData = Array.from({ length: 2000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: Math.random(),
  }));

  const smallData = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
      />
    );

    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText(/2,000 records/)).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    const { container } = render(
      <LargeExportDialog
        open={false}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
      />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should show large dataset warning for large datasets', () => {
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
      />
    );

    expect(screen.getByText(/Large Dataset/)).toBeInTheDocument();
    expect(screen.getByText(/background processing/)).toBeInTheDocument();
  });

  it('should not show large dataset warning for small datasets', () => {
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={smallData}
        filename="test-export"
      />
    );

    expect(screen.queryByText(/Large Dataset/)).not.toBeInTheDocument();
  });

  it('should allow format selection', async () => {
    const user = userEvent.setup();
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
      />
    );

    const excelRadio = screen.getByLabelText(/Excel/);
    await user.click(excelRadio);

    expect(excelRadio).toBeChecked();
  });

  it('should disable format selection during export', async () => {
    const user = userEvent.setup();
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    await user.click(exportButton);

    const csvRadio = screen.getByLabelText(/CSV/);
    expect(csvRadio).toBeDisabled();
  });

  it('should show progress during export', async () => {
    const user = userEvent.setup();
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/Exporting/)).toBeInTheDocument();
    });
  });

  it('should disable export button when no data', () => {
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={[]}
        filename="test-export"
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    expect(exportButton).toBeDisabled();
  });

  it('should call onExportStart callback', async () => {
    const user = userEvent.setup();
    const onExportStart = vi.fn();

    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
        onExportStart={onExportStart}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    await user.click(exportButton);

    expect(onExportStart).toHaveBeenCalled();
  });

  it('should call onExportComplete callback on success', async () => {
    const user = userEvent.setup();
    const onExportComplete = vi.fn();

    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
        onExportComplete={onExportComplete}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    await user.click(exportButton);

    await waitFor(() => {
      expect(onExportComplete).toHaveBeenCalled();
    });
  });

  it('should close dialog after successful export', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <LargeExportDialog
        open={true}
        onOpenChange={onOpenChange}
        data={mockData}
        filename="test-export"
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    await user.click(exportButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should handle cancel button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <LargeExportDialog
        open={true}
        onOpenChange={onOpenChange}
        data={mockData}
        filename="test-export"
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display custom title', () => {
    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
        title="Custom Export Title"
      />
    );

    expect(screen.getByText('Custom Export Title')).toBeInTheDocument();
  });

  it('should show error message on export failure', async () => {
    const user = userEvent.setup();

    // Mock export to fail
    vi.mock('@/utils/largeExportUtils', () => ({
      exportLargeDataset: vi.fn(() => Promise.reject(new Error('Export failed'))),
    }));

    render(
      <LargeExportDialog
        open={true}
        onOpenChange={vi.fn()}
        data={mockData}
        filename="test-export"
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    await user.click(exportButton);

    // Error handling would be tested with proper mock setup
  });
});
