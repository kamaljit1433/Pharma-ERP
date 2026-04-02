/**
 * LeaveBalance Component Tests
 * Tests for the LeaveBalance component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LeaveBalance } from '../LeaveBalance';
import * as leaveStore from '../../../store/leaveStore';

// Mock the store
vi.mock('../../../store/leaveStore');

describe('LeaveBalance Component', () => {
  const mockLeaveBalances = [
    {
      id: 'lb-1',
      employee_id: 'emp-123',
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
      employee_id: 'emp-123',
      leave_type_id: 'lt-2',
      year: 2024,
      opening_balance: 10,
      used_balance: 5,
      carry_forward_balance: 0,
      available_balance: 5,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

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

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: mockLeaveTypes,
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: mockLeaveBalances,
      loadingBalances: false,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });
  });

  it('should render the LeaveBalance component', () => {
    render(<LeaveBalance employeeId="emp-123" />);
    // The component renders a Card with title and description
    expect(screen.getByText('Your available leave for each leave type')).toBeInTheDocument();
  });

  it('should display leave balance cards for each leave type', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Casual Leave')).toBeInTheDocument();
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
    });
  });

  it('should display available balance correctly', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      // The component displays available balance in the cards
      const availableElements = screen.getAllByText('Available');
      expect(availableElements.length).toBeGreaterThan(0);
    });
  });

  it('should display used balance correctly', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      const usedElements = screen.getAllByText('3.0');
      expect(usedElements.length).toBeGreaterThan(0);
    });
  });

  it('should display carry forward balance when available', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      expect(screen.getByText('2.0')).toBeInTheDocument();
    });
  });

  it('should display leave type code', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      expect(screen.getByText('CL')).toBeInTheDocument();
      expect(screen.getByText('SL')).toBeInTheDocument();
    });
  });

  it('should display usage percentage in progress bar', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      // First leave: 3/12 = 25%
      // Second leave: 5/10 = 50%
      const progressElements = screen.getAllByRole('progressbar');
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });

  it('should display loading state', async () => {
    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: [],
      loadingBalances: true,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });

    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Loading leave balance...')).toBeInTheDocument();
    });
  });

  it('should display empty state when no balances available', async () => {
    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: [],
      loadingBalances: false,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });

    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      expect(screen.getByText('No leave balance data available')).toBeInTheDocument();
    });
  });

  it('should display paid/unpaid badge', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      const paidBadges = screen.getAllByText('Paid');
      expect(paidBadges.length).toBeGreaterThan(0);
    });
  });

  it('should display approval required badge when applicable', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  it('should display low balance indicator when balance is low', async () => {
    const lowBalanceData = [
      {
        id: 'lb-1',
        employee_id: 'emp-123',
        leave_type_id: 'lt-1',
        year: 2024,
        opening_balance: 12,
        used_balance: 10,
        carry_forward_balance: 0,
        available_balance: 2,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: mockLeaveTypes,
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: lowBalanceData,
      loadingBalances: false,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });

    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });

  it('should fetch leave balance on mount', async () => {
    const mockFetchLeaveBalance = vi.fn();

    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: mockLeaveTypes,
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: mockLeaveBalances,
      loadingBalances: false,
      fetchLeaveBalance: mockFetchLeaveBalance,
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });

    render(<LeaveBalance employeeId="emp-123" year={2024} />);

    await waitFor(() => {
      expect(mockFetchLeaveBalance).toHaveBeenCalledWith('emp-123', 2024);
    });
  });

  it('should display opening balance', async () => {
    render(<LeaveBalance employeeId="emp-123" />);

    await waitFor(() => {
      const openingBalanceElements = screen.getAllByText('Opening Balance');
      expect(openingBalanceElements.length).toBeGreaterThan(0);
    });
  });

  it('should display grid layout for multiple leave types', () => {
    const { container } = render(<LeaveBalance employeeId="emp-123" />);
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();
  });
});
