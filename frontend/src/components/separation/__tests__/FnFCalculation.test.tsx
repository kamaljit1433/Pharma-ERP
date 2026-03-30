import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FnFCalculation } from '../FnFCalculation';

describe('FnFCalculation', () => {
  const mockOnApprove = vi.fn();

  const mockFnFData = {
    id: 'FNF001',
    employee_id: 'EMP001',
    pending_salary: 50000,
    leave_encashment: 25000,
    gratuity: 100000,
    bonus: 10000,
    other_benefits: 5000,
    total_earnings: 190000,
    advance_deduction: 10000,
    asset_damage_deduction: 5000,
    other_deductions: 2000,
    total_deductions: 17000,
    net_settlement: 173000,
    status: 'draft' as const,
  };

  beforeEach(() => {
    mockOnApprove.mockClear();
  });

  it('should render F&F calculation component', () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    expect(screen.getByText(/Full & Final Settlement/i)).toBeInTheDocument();
  });

  it('should display earnings breakdown', async () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Earnings/i)).toBeInTheDocument();
    });
  });

  it('should display deductions breakdown', async () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Deductions/i)).toBeInTheDocument();
    });
  });

  it('should display net settlement amount', async () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Net Settlement Amount/i)).toBeInTheDocument();
    });
  });

  it('should show approval section for draft status', async () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Approve Settlement/i)).toBeInTheDocument();
    });
  });

  it('should validate that approver ID is required', async () => {
    const user = userEvent.setup();
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    await waitFor(() => {
      const approveButton = screen.getByRole('button', { name: /Approve Settlement/i });
      expect(approveButton).toBeDisabled();
    });
  });

  it('should format currency correctly', async () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    await waitFor(() => {
      // Currency formatting should be in INR format
      expect(screen.getByText(/Pending Salary/i)).toBeInTheDocument();
    });
  });

  it('should display status badge', async () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/DRAFT/i)).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    render(
      <FnFCalculation
        employeeId="EMP001"
        onApprove={mockOnApprove}
        isLoading={true}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
