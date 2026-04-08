/**
 * LeaveHistory Component Tests
 * Tests for the LeaveHistory component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeaveHistory } from '../LeaveHistory';
import { Leave } from '../../../types/leave';
import * as leaveStoreModule from '../../../store/leaveStore';

// Mock the store
vi.mock('../../../store/leaveStore', () => ({
  useLeaveStore: vi.fn(),
}));

// Mock the toast hook
vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('LeaveHistory Component', () => {
  const mockLeaves: Leave[] = [
    {
      id: 'leave-1',
      employee_id: 'emp-123',
      leave_type_id: 'lt-1',
      from_date: '2024-01-15',
      to_date: '2024-01-17',
      days_count: 3,
      reason: 'Personal work',
      status: 'approved',
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
    },
    {
      id: 'leave-2',
      employee_id: 'emp-123',
      leave_type_id: 'lt-2',
      from_date: '2024-02-01',
      to_date: '2024-02-02',
      days_count: 2,
      reason: 'Medical appointment',
      status: 'pending',
      created_at: '2024-01-20',
      updated_at: '2024-01-20',
    },
    {
      id: 'leave-3',
      employee_id: 'emp-123',
      leave_type_id: 'lt-1',
      from_date: '2024-03-01',
      to_date: '2024-03-03',
      days_count: 3,
      reason: 'Vacation',
      status: 'rejected',
      created_at: '2024-02-15',
      updated_at: '2024-02-15',
    },
    {
      id: 'leave-4',
      employee_id: 'emp-123',
      leave_type_id: 'lt-2',
      from_date: '2024-04-01',
      to_date: '2024-04-02',
      days_count: 2,
      reason: 'Emergency',
      status: 'cancelled',
      created_at: '2024-03-20',
      updated_at: '2024-03-20',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the LeaveHistory component', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Leave History')).toBeInTheDocument();
  });

  it('should display table with leave records', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);

    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
  });

  it('should display all leave records in table rows', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);

    expect(screen.getByText('Personal work')).toBeInTheDocument();
    expect(screen.getByText('Medical appointment')).toBeInTheDocument();
    expect(screen.getByText('Vacation')).toBeInTheDocument();
    expect(screen.getByText('Emergency')).toBeInTheDocument();
  });

  it('should display formatted dates', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);

    // Check for formatted dates (Jan 15, 2024 format)
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 17, 2024')).toBeInTheDocument();
  });

  it('should display days count as badge', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);

    const daysBadges = screen.getAllByText('3');
    expect(daysBadges.length).toBeGreaterThan(0);
  });

  it('should display approved status badge', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should display pending status badge', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should display rejected status badge', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('should display cancelled status badge', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('should display empty state when no leaves', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={[]} />);
    expect(screen.getByText('No leave requests found')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={[]} loading={true} />);
    expect(screen.getByText('Loading leave history...')).toBeInTheDocument();
  });

  it('should display dash when reason is not provided', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    const leavesWithoutReason: Leave[] = [
      {
        id: 'leave-1',
        employee_id: 'emp-123',
        leave_type_id: 'lt-1',
        from_date: '2024-01-15',
        to_date: '2024-01-17',
        days_count: 3,
        status: 'approved',
        created_at: '2024-01-10',
        updated_at: '2024-01-10',
      },
    ];

    render(<LeaveHistory leaves={leavesWithoutReason} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should display status icons with badges', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);

    // Check for status badges with icons
    const approvedBadges = screen.getAllByText('Approved');
    expect(approvedBadges.length).toBeGreaterThan(0);
  });

  it('should render table with correct structure', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    const { container } = render(<LeaveHistory leaves={mockLeaves} />);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    const tableHeader = container.querySelector('thead');
    expect(tableHeader).toBeInTheDocument();

    const tableBody = container.querySelector('tbody');
    expect(tableBody).toBeInTheDocument();
  });

  it('should display all leave types in records', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    render(<LeaveHistory leaves={mockLeaves} />);

    // All records should be visible
    const rows = screen.getAllByRole('row');
    // 1 header row + 4 data rows
    expect(rows.length).toBe(5);
  });

  it('should handle multiple leaves with same status', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    const sameStatusLeaves: Leave[] = [
      {
        id: 'leave-1',
        employee_id: 'emp-123',
        leave_type_id: 'lt-1',
        from_date: '2024-01-15',
        to_date: '2024-01-17',
        days_count: 3,
        reason: 'Personal work',
        status: 'approved',
        created_at: '2024-01-10',
        updated_at: '2024-01-10',
      },
      {
        id: 'leave-2',
        employee_id: 'emp-123',
        leave_type_id: 'lt-2',
        from_date: '2024-02-01',
        to_date: '2024-02-02',
        days_count: 2,
        reason: 'Medical appointment',
        status: 'approved',
        created_at: '2024-01-20',
        updated_at: '2024-01-20',
      },
    ];

    render(<LeaveHistory leaves={sameStatusLeaves} />);

    const approvedBadges = screen.getAllByText('Approved');
    expect(approvedBadges.length).toBe(2);
  });

  it('should display responsive table layout', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    const { container } = render(<LeaveHistory leaves={mockLeaves} />);

    const tableContainer = container.querySelector('.overflow-x-auto');
    expect(tableContainer).toBeInTheDocument();
  });

  it('should truncate long reasons', () => {
    vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
      cancelLeave: vi.fn(),
    } as any);

    const longReasonLeaves: Leave[] = [
      {
        id: 'leave-1',
        employee_id: 'emp-123',
        leave_type_id: 'lt-1',
        from_date: '2024-01-15',
        to_date: '2024-01-17',
        days_count: 3,
        reason: 'This is a very long reason that should be truncated in the table display',
        status: 'approved',
        created_at: '2024-01-10',
        updated_at: '2024-01-10',
      },
    ];

    const { container } = render(<LeaveHistory leaves={longReasonLeaves} />);

    const reasonCell = container.querySelector('.truncate');
    expect(reasonCell).toBeInTheDocument();
  });

  // New tests for leave cancellation functionality
  describe('Leave Cancellation', () => {
    it('should show cancel button for pending leaves', () => {
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: vi.fn(),
      } as any);

      const pendingLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: '2024-12-15',
          to_date: '2024-12-17',
          days_count: 3,
          reason: 'Vacation',
          status: 'pending',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={pendingLeaves} />);

      const cancelButtons = screen.getAllByRole('button');
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    it('should show cancel button for approved leaves with future start date', () => {
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: vi.fn(),
      } as any);

      // Create a future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 2);
      const endDateStr = endDate.toISOString().split('T')[0];

      const approvedFutureLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: futureDateStr,
          to_date: endDateStr,
          days_count: 3,
          reason: 'Vacation',
          status: 'approved',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={approvedFutureLeaves} />);

      const cancelButtons = screen.getAllByRole('button');
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    it('should not show cancel button for approved leaves with past start date', () => {
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: vi.fn(),
      } as any);

      const approvedPastLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: '2024-01-15',
          to_date: '2024-01-17',
          days_count: 3,
          reason: 'Vacation',
          status: 'approved',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={approvedPastLeaves} />);

      // Should not have cancel button for past approved leaves
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });

    it('should not show cancel button for rejected leaves', () => {
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: vi.fn(),
      } as any);

      const rejectedLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: '2024-12-15',
          to_date: '2024-12-17',
          days_count: 3,
          reason: 'Vacation',
          status: 'rejected',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={rejectedLeaves} />);

      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });

    it('should not show cancel button for cancelled leaves', () => {
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: vi.fn(),
      } as any);

      const cancelledLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: '2024-12-15',
          to_date: '2024-12-17',
          days_count: 3,
          reason: 'Vacation',
          status: 'cancelled',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={cancelledLeaves} />);

      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });

    it('should open confirmation dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: vi.fn(),
      } as any);

      const pendingLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: '2024-12-15',
          to_date: '2024-12-17',
          days_count: 3,
          reason: 'Vacation',
          status: 'pending',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={pendingLeaves} />);

      const cancelButton = screen.getByRole('button');
      await user.click(cancelButton);

      expect(screen.getByText('Cancel Leave Request?')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to cancel this leave request? This action cannot be undone.')
      ).toBeInTheDocument();
    });

    it('should call cancelLeave when confirmation is accepted', async () => {
      const user = userEvent.setup();
      const mockCancelLeave = vi.fn().mockResolvedValue(undefined);
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: mockCancelLeave,
      } as any);

      const pendingLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: '2024-12-15',
          to_date: '2024-12-17',
          days_count: 3,
          reason: 'Vacation',
          status: 'pending',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={pendingLeaves} />);

      const cancelButton = screen.getByRole('button');
      await user.click(cancelButton);

      const confirmButton = screen.getByText('Cancel Request');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockCancelLeave).toHaveBeenCalledWith('leave-1');
      });
    });

    it('should close dialog when Keep Request is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(leaveStoreModule.useLeaveStore).mockReturnValue({
        cancelLeave: vi.fn(),
      } as any);

      const pendingLeaves: Leave[] = [
        {
          id: 'leave-1',
          employee_id: 'emp-123',
          leave_type_id: 'lt-1',
          from_date: '2024-12-15',
          to_date: '2024-12-17',
          days_count: 3,
          reason: 'Vacation',
          status: 'pending',
          created_at: '2024-01-10',
          updated_at: '2024-01-10',
        },
      ];

      render(<LeaveHistory leaves={pendingLeaves} />);

      const cancelButton = screen.getByRole('button');
      await user.click(cancelButton);

      const keepButton = screen.getByText('Keep Request');
      await user.click(keepButton);

      await waitFor(() => {
        expect(screen.queryByText('Cancel Leave Request?')).not.toBeInTheDocument();
      });
    });
  });
});
