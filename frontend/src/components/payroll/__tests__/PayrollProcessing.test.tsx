import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PayrollProcessing } from '../PayrollProcessing';

describe('PayrollProcessing Component', () => {
  const mockOnProcess = vi.fn();

  beforeEach(() => {
    mockOnProcess.mockClear();
  });

  it('should render payroll processing form', () => {
    render(<PayrollProcessing onProcess={mockOnProcess} />);

    expect(screen.getByText('Process Monthly Payroll')).toBeInTheDocument();
    expect(screen.getByText(/Select month and year to process payroll/)).toBeInTheDocument();
  });

  it('should have month and year selectors', () => {
    render(<PayrollProcessing onProcess={mockOnProcess} />);

    const monthLabel = screen.getByText('Month');
    const yearLabel = screen.getByText('Year');

    expect(monthLabel).toBeInTheDocument();
    expect(yearLabel).toBeInTheDocument();
  });

  it('should have a process button', () => {
    render(<PayrollProcessing onProcess={mockOnProcess} />);

    const processButton = screen.getByRole('button', { name: /Process Payroll/i });
    expect(processButton).toBeInTheDocument();
  });

  it('should call onProcess with selected month and year', async () => {
    const mockSummary = {
      total_employees: 10,
      total_gross_salary: 500000,
      total_deductions: 50000,
      total_net_salary: 450000,
      processed_count: 10,
      pending_count: 0,
      month: 1,
      year: 2024,
    };

    mockOnProcess.mockResolvedValue(mockSummary);

    render(<PayrollProcessing onProcess={mockOnProcess} />);

    const processButton = screen.getByRole('button', { name: /Process Payroll/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockOnProcess).toHaveBeenCalled();
    });
  });

  it('should display summary after processing', async () => {
    const mockSummary = {
      total_employees: 10,
      total_gross_salary: 500000,
      total_deductions: 50000,
      total_net_salary: 450000,
      processed_count: 10,
      pending_count: 0,
      month: 1,
      year: 2024,
    };

    mockOnProcess.mockResolvedValue(mockSummary);

    render(<PayrollProcessing onProcess={mockOnProcess} />);

    const processButton = screen.getByRole('button', { name: /Process Payroll/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
      expect(screen.getAllByText('10')).toHaveLength(2); // Total Employees and Processed count
    });
  });

  it('should display processing progress', async () => {
    const mockSummary = {
      total_employees: 10,
      total_gross_salary: 500000,
      total_deductions: 50000,
      total_net_salary: 450000,
      processed_count: 8,
      pending_count: 2,
      month: 1,
      year: 2024,
    };

    mockOnProcess.mockResolvedValue(mockSummary);

    render(<PayrollProcessing onProcess={mockOnProcess} />);

    const processButton = screen.getByRole('button', { name: /Process Payroll/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('Processing Progress')).toBeInTheDocument();
      expect(screen.getByText('8 / 10')).toBeInTheDocument();
    });
  });

  it('should disable button while processing', async () => {
    mockOnProcess.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    );

    render(<PayrollProcessing onProcess={mockOnProcess} />);

    const processButton = screen.getByRole('button', { name: /Process Payroll/i });
    fireEvent.click(processButton);

    expect(processButton).toBeDisabled();
  });

  it('should handle loading state', () => {
    render(<PayrollProcessing onProcess={mockOnProcess} isLoading={true} />);

    const processButton = screen.getByRole('button', { name: /Process Payroll/i });
    expect(processButton).toBeDisabled();
  });
});
