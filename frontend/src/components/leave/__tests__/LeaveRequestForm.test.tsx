/**
 * LeaveRequestForm Component Tests
 * Tests for leave request form validation, balance checking, and API calls
 * 
 * Requirements Tested:
 * - 8.1: Provide a leave request form with leave type, dates, and reason
 * - 8.2: Validate leave dates (end date after start date)
 * - 8.3: Check leave balance before submission
 * - 8.4: Display validation errors
 * - 18.1-18.11: Form validation and error handling
 * - 30.2: Test component rendering and user interactions
 * - 30.3: Test service API calls
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeaveRequestForm } from '../LeaveRequestForm';
import { useLeaveStore } from '../../../store/leaveStore';

// Mock the leave store
vi.mock('../../../store/leaveStore', () => ({
  useLeaveStore: vi.fn(),
}));

// Mock the toast hook
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('LeaveRequestForm Component', () => {
  const mockEmployeeId = 'emp-123';
  const mockOnSuccess = vi.fn();

  const mockLeaveTypes = [
    {
      id: 'lt-1',
      name: 'Casual Leave',
      code: 'CL',
      annual_limit: 12,
      is_paid: true,
      requires_approval: true,
      carry_forward_limit: 5,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'lt-2',
      name: 'Sick Leave',
      code: 'SL',
      annual_limit: 10,
      is_paid: true,
      requires_approval: false,
      carry_forward_limit: 0,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const mockLeaveBalances = [
    {
      id: 'lb-1',
      employee_id: mockEmployeeId,
      leave_type_id: 'lt-1',
      year: 2024,
      opening_balance: 12,
      used_balance: 3,
      carry_forward_balance: 2,
      available_balance: 11,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'lb-2',
      employee_id: mockEmployeeId,
      leave_type_id: 'lt-2',
      year: 2024,
      opening_balance: 10,
      used_balance: 2,
      carry_forward_balance: 0,
      available_balance: 8,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const mockApplyLeave = vi.fn();
  const mockFetchLeaveTypes = vi.fn();
  const mockFetchLeaveBalance = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLeaveStore).mockReturnValue({
      leaveTypes: mockLeaveTypes,
      leaveBalances: mockLeaveBalances,
      leaves: [],
      fetchLeaveTypes: mockFetchLeaveTypes,
      fetchLeaveBalance: mockFetchLeaveBalance,
      applyLeave: mockApplyLeave,
      error: null,
      clearError: vi.fn(),
      // ... other store methods
    } as any);

    mockApplyLeave.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the form with all required fields', () => {
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Request Leave')).toBeInTheDocument();
      expect(screen.getByText('Leave Type *')).toBeInTheDocument();
      expect(screen.getByLabelText(/From Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/To Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Reason/)).toBeInTheDocument();
    });

    it('should fetch leave types on mount', () => {
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      expect(mockFetchLeaveTypes).toHaveBeenCalled();
    });

    it('should fetch leave balance on mount', () => {
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      expect(mockFetchLeaveBalance).toHaveBeenCalledWith(mockEmployeeId);
    });

    it('should display all leave types in dropdown', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      await waitFor(() => {
        expect(screen.getAllByText('Casual Leave').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Sick Leave').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Validation', () => {
    it('should require leave type selection', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);
      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Leave type is required')).toBeInTheDocument();
      });
    });

    it('should require from date', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const toDateInput = screen.getByLabelText(/To Date/);
      await user.type(toDateInput, '2024-12-22');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('From date is required')).toBeInTheDocument();
      });
    });

    it('should require to date', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      await user.type(fromDateInput, '2024-12-20');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('To date is required')).toBeInTheDocument();
      });
    });

    it('should validate that end date is after start date', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      await user.type(fromDateInput, '2024-12-25');
      await user.type(toDateInput, '2024-12-20');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('End date must be after or equal to start date')).toBeInTheDocument();
      });
    });

    it('should allow same day leave (end date equals start date)', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      await user.type(fromDateInput, '2024-12-25');
      await user.type(toDateInput, '2024-12-25');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApplyLeave).toHaveBeenCalled();
      });
    });
  });

  describe('Leave Balance Checking', () => {
    it('should display available leave balance for selected leave type', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      await waitFor(() => {
        expect(screen.getByText(/Available balance: 11 days/)).toBeInTheDocument();
      });
    });

    it('should display carry forward balance if available', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      await waitFor(() => {
        expect(screen.getByText(/Carry forward: 2 days/)).toBeInTheDocument();
      });
    });

    it('should calculate days count correctly', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-25');

      await waitFor(() => {
        expect(screen.getByText('Total Days: 6')).toBeInTheDocument();
      });
    });

    it('should prevent submission if insufficient balance', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      // Request 15 days but only 11 available
      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2025-01-04');

      await waitFor(() => {
        expect(screen.getByText(/Insufficient balance/)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show warning when requesting more days than available', async () => {
      const user = userEvent.setup();
      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      // Request 15 days but only 11 available
      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2025-01-04');

      await waitFor(() => {
        expect(screen.getByText(/You need 4 more days/)).toBeInTheDocument();
      });
    });

    it('should allow submission if sufficient balance', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      // Request 5 days (11 available)
      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-24');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);
      const reasonInput = screen.getByLabelText(/Reason/);

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');
      await user.type(reasonInput, 'Family vacation');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApplyLeave).toHaveBeenCalledWith({
          employee_id: mockEmployeeId,
          leave_type_id: 'lt-1',
          from_date: '2024-12-20',
          to_date: '2024-12-22',
          reason: 'Family vacation',
        });
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/) as HTMLInputElement;
      const toDateInput = screen.getByLabelText(/To Date/) as HTMLInputElement;

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fromDateInput.value).toBe('');
        expect(toDateInput.value).toBe('');
      });
    });

    it('should call onSuccess callback after submission', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

    const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should refresh leave balance after successful submission', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetchLeaveBalance).toHaveBeenCalledWith(mockEmployeeId);
      });
    });
  });

  describe('Reason Field', () => {
    it('should allow optional reason field', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      awa);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      aitFor(() => {
        expect(mockApplyLeave).toHaveBeenCalledWith(
ining({
            reason: undefined,
          })
        );
      });
    });

    it('should include reason in submission when provided', async () => {
      const user = userEvent.setup();
      mockApplyLeave.mockResolvedValue(undefined);

      render(
        <LeaveRequestForm
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
        />
      );

      const leaveTypeSelect = screen.getByRole('combobox');
      await user.click(leaveTypeSelect);

      const casualLeaveOption = await screen.findByRole('option', { name: 'Casual Leave' });
      await user.click(casualLeaveOption);

      const fromDateInput = screen.getByLabelText(/From Date/);
      const toDateInput = screen.getByLabelText(/To Date/);
      const reasonInput = screen.getByLabelText(/Reason/);

      await user.type(fromDateInput, '2024-12-20');
      await user.type(toDateInput, '2024-12-22');
      await user.type(reasonInput, 'Medical appointment');

      const submitButton = screen.getByRole('button', { name: /Submit Leave Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApplyLeave).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: 'Medical appointment',
          })
        );
      });
    });
  });
});
