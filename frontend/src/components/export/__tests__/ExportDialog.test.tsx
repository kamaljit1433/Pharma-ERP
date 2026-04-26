/**
 * Export Dialog Component Tests
 * Tests for export dialog with progress tracking
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportDialog } from '../ExportDialog';

describe('ExportDialog', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    data: mockData,
    filename: 'test-export',
    title: 'Export Test Data',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export dialog when open', () => {
    render(<ExportDialog {...defaultProps} />);
    expect(screen.getByText('Export Test Data')).toBeInTheDocument();
    expect(screen.getByText(/Choose a format to export 2 records/)).toBeInTheDocument();
  });

  it('displays format options', () => {
    render(<ExportDialog {...defaultProps} />);
    expect(screen.getByLabelText(/CSV/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Excel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/PDF/)).toBeInTheDocument();
  });

  it('selects CSV format by default', () => {
    render(<ExportDialog {...defaultProps} />);
    const csvRadio = screen.getByLabelText(/CSV/) as HTMLInputElement;
    expect(csvRadio.checked).toBe(true);
  });

  it('allows changing export format', () => {
    render(<ExportDialog {...defaultProps} />);
    const excelRadio = screen.getByLabelText(/Excel/) as HTMLInputElement;
    fireEvent.click(excelRadio);
    expect(excelRadio.checked).toBe(true);
  });

  it('disables export button when no data', () => {
    render(<ExportDialog {...defaultProps} data={[]} />);
    const exportButton = screen.getByRole('button', { name: /Export/ });
    expect(exportButton).toBeDisabled();
  });

  it('enables export button when data is available', () => {
    render(<ExportDialog {...defaultProps} />);
    const exportButton = screen.getByRole('button', { name: /Export/ });
    expect(exportButton).not.toBeDisabled();
  });

  it('calls onOpenChange when cancel button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<ExportDialog {...defaultProps} onOpenChange={onOpenChange} />);
    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    fireEvent.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows progress indicator during export', async () => {
    const onExportStart = vi.fn();
    render(
      <ExportDialog
        {...defaultProps}
        onExportStart={onExportStart}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExportStart).toHaveBeenCalled();
    });
  });

  it('calls onExportComplete after successful export', async () => {
    const onExportComplete = vi.fn();
    render(
      <ExportDialog
        {...defaultProps}
        onExportComplete={onExportComplete}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExportComplete).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('calls onExportError when export fails', async () => {
    const onExportError = vi.fn();
    render(
      <ExportDialog
        {...defaultProps}
        data={[]}
        onExportError={onExportError}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExportError).toHaveBeenCalled();
    });
  });

  it('closes dialog after successful export', async () => {
    const onOpenChange = vi.fn();
    render(
      <ExportDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export/ });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 2000 });
  });
});
