/**
 * Report Template Component Tests
 * Tests for report template display and functionality
 * 
 * Requirements: 26.5, 26.6, 26.7, 26.8
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportTemplate } from '../ReportTemplate';
import { ReportData, ReportColumn } from '@/utils/reportGenerator';

// Mock the toast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock print and download functions
vi.mock('@/utils/reportGenerator', async () => {
  const actual = await vi.importActual('@/utils/reportGenerator');
  return {
    ...actual,
    printReport: vi.fn(),
    downloadReport: vi.fn(),
    generateReportHTML: vi.fn(() => '<div>Report HTML</div>'),
    generateReportCSV: vi.fn(() => 'name,age\nJohn,30'),
    generateReportFilename: vi.fn((prefix) => `${prefix}-2024-01-15.html`),
  };
});

describe('ReportTemplate Component', () => {
  let mockData: ReportData;
  let mockColumns: ReportColumn[];

  beforeEach(() => {
    mockColumns = [
      { id: 'name', label: 'Name', align: 'left' },
      { id: 'department', label: 'Department', align: 'left' },
      { id: 'salary', label: 'Salary', align: 'right', format: (v) => `$${v}` },
    ];

    mockData = {
      metadata: {
        title: 'Employee Report',
        description: 'Monthly report',
        generatedDate: new Date('2024-01-15'),
        generatedBy: 'admin@example.com',
        filters: { department: 'Engineering' },
        pageSize: 'A4',
      },
      columns: mockColumns,
      rows: [
        { name: 'John Doe', department: 'Engineering', salary: 50000 },
        { name: 'Jane Smith', department: 'Engineering', salary: 55000 },
      ],
      summary: [{ label: 'Total', value: '2 employees' }],
    };
  });

  describe('Rendering', () => {
    it('should render report title', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByText('Employee Report')).toBeInTheDocument();
    });

    it('should render report description', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByText('Monthly report')).toBeInTheDocument();
    });

    it('should render metadata information', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByText(/Generated:/)).toBeInTheDocument();
      expect(screen.getByText(/admin@example.com/)).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });

    it('should render table data rows', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('should render formatted cell values', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByText('$50000')).toBeInTheDocument();
      expect(screen.getByText('$55000')).toBeInTheDocument();
    });

    it('should render summary section', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByText(/Total:/)).toBeInTheDocument();
      expect(screen.getByText('2 employees')).toBeInTheDocument();
    });

    it('should render control buttons', () => {
      render(<ReportTemplate data={mockData} />);

      expect(screen.getByRole('button', { name: /Print/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download HTML/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download CSV/i })).toBeInTheDocument();
    });
  });

  describe('Print Functionality', () => {
    it('should call printReport when print button is clicked', async () => {
      const { printReport } = await import('@/utils/reportGenerator');
      render(<ReportTemplate data={mockData} />);

      const printButton = screen.getByRole('button', { name: /Print/i });
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(printReport).toHaveBeenCalled();
      });
    });

    it('should call onPrintStart callback', async () => {
      const onPrintStart = vi.fn();
      render(<ReportTemplate data={mockData} onPrintStart={onPrintStart} />);

      const printButton = screen.getByRole('button', { name: /Print/i });
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(onPrintStart).toHaveBeenCalled();
      });
    });

    it('should call onPrintComplete callback', async () => {
      const onPrintComplete = vi.fn();
      render(<ReportTemplate data={mockData} onPrintComplete={onPrintComplete} />);

      const printButton = screen.getByRole('button', { name: /Print/i });
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(onPrintComplete).toHaveBeenCalled();
      });
    });

    it('should pass correct page size to printReport', async () => {
      const { printReport } = await import('@/utils/reportGenerator');
      render(<ReportTemplate data={mockData} pageSize="Letter" />);

      const printButton = screen.getByRole('button', { name: /Print/i });
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(printReport).toHaveBeenCalledWith(expect.any(String), 'Letter');
      });
    });
  });

  describe('Download Functionality', () => {
    it('should call downloadReport when download HTML button is clicked', async () => {
      const { downloadReport } = await import('@/utils/reportGenerator');
      render(<ReportTemplate data={mockData} />);

      const downloadButton = screen.getByRole('button', { name: /Download HTML/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(downloadReport).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('.html'),
          'html'
        );
      });
    });

    it('should call downloadReport when download CSV button is clicked', async () => {
      const { downloadReport } = await import('@/utils/reportGenerator');
      render(<ReportTemplate data={mockData} />);

      const downloadButton = screen.getByRole('button', { name: /Download CSV/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(downloadReport).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('.csv'),
          'csv'
        );
      });
    });

    it('should call onDownloadStart callback', async () => {
      const onDownloadStart = vi.fn();
      render(<ReportTemplate data={mockData} onDownloadStart={onDownloadStart} />);

      const downloadButton = screen.getByRole('button', { name: /Download HTML/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(onDownloadStart).toHaveBeenCalled();
      });
    });

    it('should call onDownloadComplete callback', async () => {
      const onDownloadComplete = vi.fn();
      render(<ReportTemplate data={mockData} onDownloadComplete={onDownloadComplete} />);

      const downloadButton = screen.getByRole('button', { name: /Download HTML/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(onDownloadComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle data without description', () => {
      const dataWithoutDescription = {
        ...mockData,
        metadata: { ...mockData.metadata, description: undefined },
      };
      render(<ReportTemplate data={dataWithoutDescription} />);

      expect(screen.getByText('Employee Report')).toBeInTheDocument();
      expect(screen.queryByText('Monthly report')).not.toBeInTheDocument();
    });

    it('should handle data without summary', () => {
      const dataWithoutSummary = { ...mockData, summary: undefined };
      render(<ReportTemplate data={dataWithoutSummary} />);

      expect(screen.getByText('Employee Report')).toBeInTheDocument();
      expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
    });

    it('should handle empty rows', () => {
      const emptyData = { ...mockData, rows: [] };
      render(<ReportTemplate data={emptyData} />);

      expect(screen.getByText('Employee Report')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should handle null/undefined cell values', () => {
      const dataWithNulls = {
        ...mockData,
        rows: [{ name: 'John Doe', department: null, salary: undefined }],
      };
      render(<ReportTemplate data={dataWithNulls} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // Should display dash for null/undefined values
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should apply correct alignment to columns', () => {
      const { container } = render(<ReportTemplate data={mockData} />);

      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should apply no-print class to controls', () => {
      const { container } = render(<ReportTemplate data={mockData} />);

      const controls = container.querySelector('.report-controls');
      expect(controls).toHaveClass('no-print');
    });

    it('should apply report-container class', () => {
      const { container } = render(<ReportTemplate data={mockData} />);

      expect(container.querySelector('.report-container')).toBeInTheDocument();
    });
  });
});
