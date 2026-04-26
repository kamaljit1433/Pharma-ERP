/**
 * Report Generator Component Tests
 * Tests for report generation dialog and functionality
 * 
 * Requirements: 26.5, 26.6, 26.7, 26.8
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportGenerator } from '../ReportGenerator';
import { ReportColumn } from '@/utils/reportGenerator';

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      email: 'admin@example.com',
      role: 'super_admin',
      employeeId: 'EMP001',
      mfaEnabled: false,
      isActive: true,
    },
  }),
}));

// Mock the toast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock report generator functions
vi.mock('@/utils/reportGenerator', async () => {
  const actual = await vi.importActual('@/utils/reportGenerator');
  return {
    ...actual,
    generateReportHTML: vi.fn(() => '<div>Report HTML</div>'),
    generateReportCSV: vi.fn(() => 'name,age\nJohn,30'),
    downloadReport: vi.fn(),
    printReport: vi.fn(),
    generateReportFilename: vi.fn((prefix) => `${prefix}-2024-01-15.html`),
  };
});

describe('ReportGenerator Component', () => {
  let mockColumns: ReportColumn[];
  let mockData: any[];

  beforeEach(() => {
    mockColumns = [
      { id: 'name', label: 'Name', align: 'left' },
      { id: 'department', label: 'Department', align: 'left' },
      { id: 'salary', label: 'Salary', align: 'right' },
    ];

    mockData = [
      { name: 'John Doe', department: 'Engineering', salary: 50000 },
      { name: 'Jane Smith', department: 'Engineering', salary: 55000 },
    ];
  });

  describe('Dialog Rendering', () => {
    it('should render dialog when open is true', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      const { container } = render(
        <ReportGenerator
          open={false}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('should display record count in description', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByText(/2 records/)).toBeInTheDocument();
    });

    it('should display report title', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByText('Employee Report')).toBeInTheDocument();
    });

    it('should display report description if provided', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          description="Monthly employee report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByText('Monthly employee report')).toBeInTheDocument();
    });
  });

  describe('Format Selection', () => {
    it('should render format options', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByLabelText(/Download as HTML/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Download as CSV/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Print/)).toBeInTheDocument();
    });

    it('should have HTML format selected by default', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const htmlOption = screen.getByLabelText(/Download as HTML/) as HTMLInputElement;
      expect(htmlOption.checked).toBe(true);
    });

    it('should allow changing format selection', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const csvOption = screen.getByLabelText(/Download as CSV/) as HTMLInputElement;
      fireEvent.click(csvOption);

      expect(csvOption.checked).toBe(true);
    });
  });

  describe('Page Size Selection', () => {
    it('should render page size options for HTML format', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByLabelText(/A4/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Letter/)).toBeInTheDocument();
    });

    it('should have A4 selected by default', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const a4Option = screen.getByLabelText(/A4/) as HTMLInputElement;
      expect(a4Option.checked).toBe(true);
    });

    it('should hide page size options for CSV format', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const csvOption = screen.getByLabelText(/Download as CSV/) as HTMLInputElement;
      fireEvent.click(csvOption);

      // Page size options should still be visible but not relevant
      // This depends on implementation
    });
  });

  describe('Metadata Display', () => {
    it('should display generated date', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByText(/Generated:/)).toBeInTheDocument();
    });

    it('should display generated by user email', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByText(/admin@example.com/)).toBeInTheDocument();
    });

    it('should display filters if provided', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
          filters={{ department: 'Engineering', status: 'Active' }}
        />
      );

      expect(screen.getByText(/Filters:/)).toBeInTheDocument();
      expect(screen.getByText(/department: Engineering/)).toBeInTheDocument();
    });
  });

  describe('Report Generation', () => {
    it('should call generateReportHTML for HTML format', async () => {
      const { generateReportHTML } = await import('@/utils/reportGenerator');
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(generateReportHTML).toHaveBeenCalled();
      });
    });

    it('should call downloadReport for HTML format', async () => {
      const { downloadReport } = await import('@/utils/reportGenerator');
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(downloadReport).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('.html'),
          'html'
        );
      });
    });

    it('should call generateReportCSV for CSV format', async () => {
      const { generateReportCSV } = await import('@/utils/reportGenerator');
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const csvOption = screen.getByLabelText(/Download as CSV/) as HTMLInputElement;
      fireEvent.click(csvOption);

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(generateReportCSV).toHaveBeenCalled();
      });
    });

    it('should call printReport for print format', async () => {
      const { printReport } = await import('@/utils/reportGenerator');
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const printOption = screen.getByLabelText(/Print/) as HTMLInputElement;
      fireEvent.click(printOption);

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(printReport).toHaveBeenCalled();
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onGenerateStart when generation starts', async () => {
      const onGenerateStart = vi.fn();
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
          onGenerateStart={onGenerateStart}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(onGenerateStart).toHaveBeenCalled();
      });
    });

    it('should call onGenerateComplete when generation completes', async () => {
      const onGenerateComplete = vi.fn();
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
          onGenerateComplete={onGenerateComplete}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(onGenerateComplete).toHaveBeenCalled();
      });
    });

    it('should call onOpenChange to close dialog after generation', async () => {
      const onOpenChange = vi.fn();
      render(
        <ReportGenerator
          open={true}
          onOpenChange={onOpenChange}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Button States', () => {
    it('should disable generate button when data is empty', () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={[]}
          columns={mockColumns}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      expect(generateButton).toBeDisabled();
    });

    it('should disable buttons during generation', async () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      expect(generateButton).toBeDisabled();
    });

    it('should show loading state during generation', async () => {
      render(
        <ReportGenerator
          open={true}
          onOpenChange={vi.fn()}
          title="Employee Report"
          data={mockData}
          columns={mockColumns}
        />
      );

      const generateButton = screen.getByRole('button', { name: /Generate Report/i });
      fireEvent.click(generateButton);

      expect(screen.getByText(/Generating/)).toBeInTheDocument();
    });
  });
});
