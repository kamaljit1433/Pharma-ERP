/**
 * LeaveHistory Component Tests
 * Tests for the LeaveHistory component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeaveHistory } from '../LeaveHistory';
import { Leave } from '../../../types/leave';

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

  it('should render the LeaveHistory component', () => {
    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Leave History')).toBeInTheDocument();
  });

  it('should display table with leave records', () => {
    render(<LeaveHistory leaves={mockLeaves} />);

    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
  });

  it('should display all leave records in table rows', () => {
    render(<LeaveHistory leaves={mockLeaves} />);

    expect(screen.getByText('Personal work')).toBeInTheDocument();
    expect(screen.getByText('Medical appointment')).toBeInTheDocument();
    expect(screen.getByText('Vacation')).toBeInTheDocument();
    expect(screen.getByText('Emergency')).toBeInTheDocument();
  });

  it('should display formatted dates', () => {
    render(<LeaveHistory leaves={mockLeaves} />);

    // Check for formatted dates (Jan 15, 2024 format)
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 17, 2024')).toBeInTheDocument();
  });

  it('should display days count as badge', () => {
    render(<LeaveHistory leaves={mockLeaves} />);

    const daysBadges = screen.getAllByText('3');
    expect(daysBadges.length).toBeGreaterThan(0);
  });

  it('should display approved status badge', () => {
    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should display pending status badge', () => {
    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should display rejected status badge', () => {
    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('should display cancelled status badge', () => {
    render(<LeaveHistory leaves={mockLeaves} />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('should display empty state when no leaves', () => {
    render(<LeaveHistory leaves={[]} />);
    expect(screen.getByText('No leave requests found')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<LeaveHistory leaves={[]} loading={true} />);
    expect(screen.getByText('Loading leave history...')).toBeInTheDocument();
  });

  it('should display dash when reason is not provided', () => {
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
    render(<LeaveHistory leaves={mockLeaves} />);

    // Check for status badges with icons
    const approvedBadges = screen.getAllByText('Approved');
    expect(approvedBadges.length).toBeGreaterThan(0);
  });

  it('should render table with correct structure', () => {
    const { container } = render(<LeaveHistory leaves={mockLeaves} />);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    const tableHeader = container.querySelector('thead');
    expect(tableHeader).toBeInTheDocument();

    const tableBody = container.querySelector('tbody');
    expect(tableBody).toBeInTheDocument();
  });

  it('should display all leave types in records', () => {
    render(<LeaveHistory leaves={mockLeaves} />);

    // All records should be visible
    const rows = screen.getAllByRole('row');
    // 1 header row + 4 data rows
    expect(rows.length).toBe(5);
  });

  it('should handle multiple leaves with same status', () => {
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
    const { container } = render(<LeaveHistory leaves={mockLeaves} />);

    const tableContainer = container.querySelector('.overflow-x-auto');
    expect(tableContainer).toBeInTheDocument();
  });

  it('should truncate long reasons', () => {
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
});
