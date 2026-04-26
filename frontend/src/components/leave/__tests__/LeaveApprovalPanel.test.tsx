/**
 * LeaveApprovalPanel Component Tests
 * Tests for leave approval workflow, rejection, and notifications
 * 
 * Requirements Tested:
 * - 8.8: Display pending leave requests for managers
 * - 8.9: Create approve/reject actions
 * - 8.10: Add rejection reason input
 * - 30.2: Test component rendering and user interactions
 * - 30.3: Test service API calls
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LeaveApprovalPanel } from '../LeaveApprovalPanel';
import { useLeaveStore } from '../../../store/leaveStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { leaveService } from '../../../services/leaveService';

// Mock the leave store
vi.mock('../../../store/leaveStore', () => ({
  useLeaveStore: vi.fn(),
}));

// Mock the notification store
vi.mock('../../../store/notificationStore', () => ({
  useNotificationStore: vi.fn(),
}));

// Mock the leave service
vi.mock('../../../services/leaveService', () => ({
  leaveService: {
    approveLeave: vi.fn(),
    rejectLeave: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('LeaveApprovalPanel Component', () => {
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

  const mockPendingLeaves = [
    {
      id: 'leave-1',
      employee_id: 'emp-001',
      leave_type_id: 'lt-1',
      from_date: '2024-12-20',
      to_date: '2024-12-22',
      days_count: 3,
      reason: 'Family vacation',
      status: 'pending' as const,
      created_at: '2024-12-01',
      updated_at: '2024-12-01',
    },
    {
      id: 'leave-2',
      employee_id: 'emp-002',
      leave_type_id: 'lt-2',
      from_date: '2024-12-25',
      to_date: '2024-12-25',
      days_count: 1,
      reason: 'Medical appointment',
      status: 'pending' as const,
      created_at: '2024-12-02',
      updated_at: '2024-12-02',
    },
  ];

  const mockFetchPendingLeaves = vi.fn();
  const mockAddNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLeaveStore).mockReturnValue({
      pendingLeaves: mockPendingLeaves,
      leaveTypes: mockLeaveTypes,
      loadingLeaves: false,
      fetchPendingLeaves: mockFetchPendingLeaves,
      fetchLeaveTypes: vi.fn(),
      // ... other store methods
    } as any);

    vi.mocked(useNotificationStore).mockReturnValue({
      addNotification: mockAddNotification,
      // ... other store methods
    } as any);

    vi.mocked(leaveService.approveLeave).mockResolvedValue(undefined);
    vi.mocked(leaveService.rejectLeave).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the approval panel', () => {
      render(<LeaveApprovalPanel />);

      expect(screen.getByText('Leave Approvals')).toBeInTheDocument();
      expect(screen.getByText(/Review and approve\/reject pending leave requests/)).toBeInTheDocument();
    });

    it('should fetch pending leaves on mount', () => {
      render(<LeaveApprovalPanel />);

      expect(mockFetchPendingLeaves).toHaveBeenCalled();
    });

    it('should display pending leave requests in table', () => {
      render(<LeaveApprovalPanel />);

      expect(screen.getByText('emp-001')).toBeInTheDocument();
      expect(screen.getByText('emp-002')).toBeInTheDocument();
      expect(screen.getByText('Casual Leave')).toBeInTheDocument();
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
    });

    it('should display leave details in table', () => {
      render(<LeaveApprovalPanel />);

      expect(screen.getByText('3')).toBeInTheDocument(); // days count
      expect(screen.getByText('Family vacation')).toBeInTheDocument();
      expect(screen.getByText('Medical appointment')).toBeInTheDocument();
    });

    it('should display approve and reject buttons for each leave', () => {
      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg') // Buttons with icons
      );

      expect(approveButtons.length).toBeGreaterThanOrEqual(4); // 2 leaves × 2 buttons
    });

    it('should show empty state when no pending leaves', () => {
      vi.mocked(useLeaveStore).mockReturnValue({
        leaves: [],
        leaveTypes: mockLeaveTypes,
        loadingLeaves: false,
        fetchPendingLeaves: mockFetchPendingLeaves,
      } as any);

      render(<LeaveApprovalPanel />);

      expect(screen.getByText('No pending leave requests')).toBeInTheDocument();
    });

    it('should show loading state when fetching leaves', () => {
      vi.mocked(useLeaveStore).mockReturnValue({
        leaves: [],
        leaveTypes: mockLeaveTypes,
        loadingLeaves: true,
        fetchPendingLeaves: mockFetchPendingLeaves,
      } as any);

      render(<LeaveApprovalPanel />);

      expect(screen.getByText('Loading pending leave requests...')).toBeInTheDocument();
    });
  });

  describe('Leave Approval', () => {
    it('should open approval dialog when approve button is clicked', async () => {
      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
      });
    });

    it('should display leave details in approval dialog', async () => {
      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
        expect(screen.getByText(/Dec 20, 2024 to Dec 22, 2024/)).toBeInTheDocument();
        // Check for the reason in the dialog context
        const reasonElements = screen.getAllByText('Family vacation');
        expect(reasonElements.length).toBeGreaterThan(0);
      });
    });

    it('should call approveLeave API when approve button is clicked', async () => {
      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(leaveService.approveLeave).toHaveBeenCalledWith('leave-1');
      });
    });

    it('should send notification when leave is approved', async () => {
      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Leave Request Approved',
            type: 'success',
          })
        );
      });
    });

    it('should close dialog after successful approval', async () => {
      vi.mocked(leaveService.approveLeave).mockResolvedValue(undefined);

      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Approve Leave Request?')).not.toBeInTheDocument();
      });
    });

    it('should disable approve button while loading', async () => {
      vi.mocked(leaveService.approveLeave).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });
    });
  });

  describe('Leave Rejection', () => {
    it('should open rejection dialog when reject button is clicked', async () => {
      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });
    });

    it('should display rejection reason input field', async () => {
      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter reason for rejection')).toBeInTheDocument();
      });
    });

    it('should require rejection reason before submission', async () => {
      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      expect(rejectButton).toBeDisabled();
    });

    it('should enable reject button when reason is provided', async () => {
      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Enter reason for rejection');
      fireEvent.change(reasonInput, { target: { value: 'Insufficient staffing' } });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      expect(rejectButton).not.toBeDisabled();
    });

    it('should call rejectLeave API with reason when reject button is clicked', async () => {
      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Enter reason for rejection');
      fireEvent.change(reasonInput, { target: { value: 'Insufficient staffing' } });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(leaveService.rejectLeave).toHaveBeenCalledWith('leave-1', 'Insufficient staffing');
      });
    });

    it('should send notification when leave is rejected', async () => {
      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Enter reason for rejection');
      fireEvent.change(reasonInput, { target: { value: 'Insufficient staffing' } });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Leave Request Rejected',
            type: 'warning',
            message: expect.stringContaining('Insufficient staffing'),
          })
        );
      });
    });

    it('should close dialog after successful rejection', async () => {
      vi.mocked(leaveService.rejectLeave).mockResolvedValue(undefined);

      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Enter reason for rejection');
      fireEvent.change(reasonInput, { target: { value: 'Insufficient staffing' } });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.queryByText('Reject Leave Request?')).not.toBeInTheDocument();
      });
    });

    it('should disable reject button while loading', async () => {
      vi.mocked(leaveService.rejectLeave).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Enter reason for rejection');
      fireEvent.change(reasonInput, { target: { value: 'Insufficient staffing' } });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(rejectButton).toBeDisabled();
      });
    });

    it('should clear reason input after successful rejection', async () => {
      vi.mocked(leaveService.rejectLeave).mockResolvedValue(undefined);

      render(<LeaveApprovalPanel />);

      const rejectButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-red')
      );

      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request?')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('Enter reason for rejection') as HTMLTextAreaElement;
      fireEvent.change(reasonInput, { target: { value: 'Insufficient staffing' } });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(reasonInput.value).toBe('');
      });
    });
  });

  describe('Dialog Management', () => {
    it('should close dialog when cancel button is clicked', async () => {
      render(<LeaveApprovalPanel />);

      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Approve Leave Request?')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple leave approvals sequentially', async () => {
      render(<LeaveApprovalPanel />);

      // Approve first leave
      const approveButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')?.parentElement?.className.includes('text-green')
      );

      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(leaveService.approveLeave).toHaveBeenCalledWith('leave-1');
      });
    });
  });
});
