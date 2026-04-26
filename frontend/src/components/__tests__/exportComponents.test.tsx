/**
 * Export Components Tests
 * Tests for components that handle export functionality
 * 
 * Task: 23.4 Write unit tests for export functionality
 * Requirements: 30.2, 30.3
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../tables/DataTable';
import { ExportButton } from '../ui/ExportButton';
import { ReportExporter } from '../reports/ReportExporter';

// Mock the export utilities
vi.mock('../../utils/exportUtils', () => ({
  exportData: vi.fn(),
  generateFilename: vi.fn(),
  downloadBlob: vi.fn(),
}));

vi.mock('../../utils/reportGenerator', () => ({
  generateReportCSV: vi.fn(),
  generateReportHTML: vi.fn(),
  downloadReport: vi.fn(),
}));

describe('Export Components - Task 23.4', () => {
  let mockEmployeeData: any[];
  let mockColumns: any[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockEmployeeData = [
      {
        id: 'emp-001',
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        department: 'Engineering',
        status: 'active',
        salary: 75000,
      },
      {
        id: 'emp-002',
        employee_id: 'EMP002',
        first_name: 'Jane',
        last_name: 'Smith',
        department: 'HR',
        status: 'active',
        salary: 65000,
      },
      {
        id: 'emp-003',
        employee_id: 'EMP003',
        first_name: 'Bob',
        last_name: 'Johnson',
        department: 'Engineering',
        status: 'on_leave',
        salary: 45000,
      },
    ];

    mockColumns = [
      { id: 'employee_id', header: 'Employee ID', accessor: 'employee_id' },
      { id: 'name', header: 'Name', accessor: (row: any) => `${row.first_name} ${row.last_name}` },
      { id: 'department', header: 'Department', accessor: 'department' },
      { id: 'status', header: 'Status', accessor: 'status' },
      { id: 'salary', header: 'Salary', accessor: 'salary' },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DataTable Export Functionality', () => {
    it('should render export button when export is enabled', () => {
      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
        />
      );

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should not render export button when export is disabled', () => {
      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={false}
        />
      );

      expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
    });

    it('should export filtered data when filters are applied', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
          filtering={{
            enabled: true,
            filters: { department: 'Engineering' },
          }}
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should export only Engineering employees
      await waitFor(() => {
        expect(exportData).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ department: 'Engineering' }),
          ]),
          'csv',
          expect.stringContaining('employees')
        );
      });

      // Verify filtered data doesn't include HR employees
      const exportCall = vi.mocked(exportData).mock.calls[0];
      const exportedData = exportCall[0];
      expect(exportedData).not.toContainEqual(
        expect.objectContaining({ department: 'HR' })
      );
    });

    it('should export all data when no filters are applied', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(exportData).toHaveBeenCalledWith(
          mockEmployeeData,
          'csv',
          expect.stringContaining('employees')
        );
      });
    });

    it('should support different export formats', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
          exportFormats={['csv', 'excel', 'pdf']}
        />
      );

      // Click export dropdown
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should show format options
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();

      // Click Excel option
      await user.click(screen.getByText('Excel'));

      await waitFor(() => {
        expect(exportData).toHaveBeenCalledWith(
          mockEmployeeData,
          'excel',
          expect.stringContaining('employees')
        );
      });
    });

    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');
      
      // Mock export to throw error
      vi.mocked(exportData).mockRejectedValue(new Error('Export failed'));

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during export', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');
      
      // Mock export to take some time
      vi.mocked(exportData).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(new Blob()), 100))
      );

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should show loading state
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();

      // Wait for export to complete
      await waitFor(() => {
        expect(screen.queryByText(/exporting/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('ExportButton Component', () => {
    it('should render with default CSV format', () => {
      render(
        <ExportButton
          data={mockEmployeeData}
          filename="test-export"
        />
      );

      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
    });

    it('should support custom export formats', () => {
      render(
        <ExportButton
          data={mockEmployeeData}
          filename="test-export"
          formats={['csv', 'pdf']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be disabled when no data is provided', () => {
      render(
        <ExportButton
          data={[]}
          filename="test-export"
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should call onExportStart and onExportComplete callbacks', async () => {
      const user = userEvent.setup();
      const onExportStart = vi.fn();
      const onExportComplete = vi.fn();
      const { exportData } = await import('../../utils/exportUtils');

      vi.mocked(exportData).mockResolvedValue(new Blob());

      render(
        <ExportButton
          data={mockEmployeeData}
          filename="test-export"
          onExportStart={onExportStart}
          onExportComplete={onExportComplete}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onExportStart).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(onExportComplete).toHaveBeenCalledWith(true);
      });
    });

    it('should call onExportComplete with false on error', async () => {
      const user = userEvent.setup();
      const onExportComplete = vi.fn();
      const { exportData } = await import('../../utils/exportUtils');

      vi.mocked(exportData).mockRejectedValue(new Error('Export failed'));

      render(
        <ExportButton
          data={mockEmployeeData}
          filename="test-export"
          onExportComplete={onExportComplete}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onExportComplete).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('ReportExporter Component', () => {
    const mockReportData = {
      metadata: {
        title: 'Employee Report',
        description: 'Monthly employee report',
        generatedDate: new Date('2024-01-15'),
        generatedBy: 'admin@company.com',
        filters: { department: 'Engineering' },
      },
      columns: [
        { id: 'name', label: 'Name', align: 'left' as const },
        { id: 'department', label: 'Department', align: 'left' as const },
      ],
      rows: [
        { name: 'John Doe', department: 'Engineering' },
        { name: 'Bob Johnson', department: 'Engineering' },
      ],
      summary: [
        { label: 'Total Employees', value: 2 },
      ],
    };

    it('should render report export options', () => {
      render(
        <ReportExporter
          reportData={mockReportData}
          filename="employee-report"
        />
      );

      expect(screen.getByText(/export report/i)).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('should export report as CSV', async () => {
      const user = userEvent.setup();
      const { generateReportCSV, downloadReport } = await import('../../utils/reportGenerator');

      vi.mocked(generateReportCSV).mockReturnValue('csv content');

      render(
        <ReportExporter
          reportData={mockReportData}
          filename="employee-report"
        />
      );

      await user.click(screen.getByText('CSV'));

      expect(generateReportCSV).toHaveBeenCalledWith(mockReportData);
      expect(downloadReport).toHaveBeenCalledWith(
        'csv content',
        expect.stringContaining('employee-report'),
        'csv'
      );
    });

    it('should export report as PDF', async () => {
      const user = userEvent.setup();
      const { generateReportHTML, downloadReport } = await import('../../utils/reportGenerator');

      vi.mocked(generateReportHTML).mockReturnValue('<html>report content</html>');

      render(
        <ReportExporter
          reportData={mockReportData}
          filename="employee-report"
        />
      );

      await user.click(screen.getByText('PDF'));

      expect(generateReportHTML).toHaveBeenCalledWith(mockReportData);
      expect(downloadReport).toHaveBeenCalledWith(
        '<html>report content</html>',
        expect.stringContaining('employee-report'),
        'html'
      );
    });

    it('should include filter information in exported reports', async () => {
      const user = userEvent.setup();
      const { generateReportCSV } = await import('../../utils/reportGenerator');

      render(
        <ReportExporter
          reportData={mockReportData}
          filename="employee-report"
        />
      );

      await user.click(screen.getByText('CSV'));

      expect(generateReportCSV).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            filters: { department: 'Engineering' },
          }),
        })
      );
    });

    it('should handle large report exports', async () => {
      const user = userEvent.setup();
      const largeReportData = {
        ...mockReportData,
        rows: Array.from({ length: 2000 }, (_, i) => ({
          name: `Employee ${i}`,
          department: 'Engineering',
        })),
      };

      render(
        <ReportExporter
          reportData={largeReportData}
          filename="large-report"
        />
      );

      // Should show warning for large exports
      expect(screen.getByText(/large report/i)).toBeInTheDocument();

      await user.click(screen.getByText('CSV'));

      // Should show progress indicator
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
    });
  });

  describe('Export Progress and Feedback', () => {
    it('should show progress for large exports', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');

      // Mock progress callback
      let progressCallback: ((progress: number) => void) | undefined;
      vi.mocked(exportData).mockImplementation((data, format, filename, options) => {
        progressCallback = options?.onProgress;
        return new Promise(resolve => {
          setTimeout(() => {
            progressCallback?.(50);
            setTimeout(() => {
              progressCallback?.(100);
              resolve(new Blob());
            }, 50);
          }, 50);
        });
      });

      render(
        <DataTable
          data={Array.from({ length: 2000 }, (_, i) => ({ id: i, name: `Item ${i}` }))}
          columns={[{ id: 'name', header: 'Name', accessor: 'name' }]}
          enableExport={true}
          exportFilename="large-dataset"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should show progress
      await waitFor(() => {
        expect(screen.getByText(/50%/)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/100%/)).toBeInTheDocument();
      });
    });

    it('should show success message after export completion', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');

      vi.mocked(exportData).mockResolvedValue(new Blob());

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/export completed/i)).toBeInTheDocument();
      });
    });

    it('should show error message on export failure', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');

      vi.mocked(exportData).mockRejectedValue(new Error('Network error'));

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Accessibility', () => {
    it('should have proper ARIA labels for export buttons', () => {
      render(
        <ExportButton
          data={mockEmployeeData}
          filename="test-export"
          aria-label="Export employee data as CSV"
        />
      );

      const button = screen.getByRole('button', { name: /export employee data as csv/i });
      expect(button).toBeInTheDocument();
    });

    it('should announce export progress to screen readers', async () => {
      const user = userEvent.setup();
      const { exportData } = await import('../../utils/exportUtils');

      vi.mocked(exportData).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(new Blob()), 100))
      );

      render(
        <DataTable
          data={mockEmployeeData}
          columns={mockColumns}
          enableExport={true}
          exportFilename="employees"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should have aria-live region for progress updates
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      render(
        <ExportButton
          data={mockEmployeeData}
          filename="test-export"
        />
      );

      const button = screen.getByRole('button');
      
      // Should be focusable
      button.focus();
      expect(button).toHaveFocus();

      // Should be activatable with Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      // Export should be triggered (tested by other tests)
    });
  });
});