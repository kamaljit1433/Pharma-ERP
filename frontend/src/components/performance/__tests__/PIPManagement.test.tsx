import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PIPManagement } from '../PIPManagement';
import { usePerformanceStore } from '../../../store/performanceStore';
import { vi } from 'vitest';

vi.mock('../../../store/performanceStore');

describe('PIPManagement Component', () => {
  const mockFetchActivePIPs = vi.fn();
  const mockInitiatePIP = vi.fn();
  const mockRecordPIPOutcome = vi.fn();
  const mockClearError = vi.fn();

  const mockPIPs = [
    {
      id: 'pip1',
      employeeId: 'emp1',
      initiatedBy: 'mgr1',
      goalIds: ['goal1', 'goal2'],
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      status: 'Active' as const,
      createdAt: '2025-12-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (usePerformanceStore as any).mockReturnValue({
      pips: mockPIPs,
      loadingPIPs: false,
      fetchActivePIPs: mockFetchActivePIPs,
      initiatePIP: mockInitiatePIP,
      recordPIPOutcome: mockRecordPIPOutcome,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders PIP management page', () => {
    render(<PIPManagement />);
    expect(screen.getByText('Performance Improvement Plans')).toBeInTheDocument();
  });

  it('displays list of active PIPs', () => {
    render(<PIPManagement />);
    expect(screen.getByText('Employee: emp1')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays goal IDs for each PIP', () => {
    render(<PIPManagement />);
    expect(screen.getByText('goal1')).toBeInTheDocument();
    expect(screen.getByText('goal2')).toBeInTheDocument();
  });

  it('opens create PIP dialog', async () => {
    render(<PIPManagement />);
    const createButton = screen.getByRole('button', { name: /Create PIP/i });
    await userEvent.click(createButton);
    expect(screen.getByText('Initiate Performance Improvement Plan')).toBeInTheDocument();
  });

  it('creates new PIP', async () => {
    mockInitiatePIP.mockResolvedValue({});
    render(<PIPManagement />);

    const createButton = screen.getByRole('button', { name: /Create PIP/i });
    await userEvent.click(createButton);

    const employeeIdInput = screen.getByLabelText('Employee ID');
    await userEvent.type(employeeIdInput, 'emp2');

    const goalIdsInput = screen.getByLabelText('Goal IDs (comma-separated)');
    await userEvent.type(goalIdsInput, 'goal1, goal2, goal3');

    const startDateInput = screen.getByLabelText('PIP start date');
    await userEvent.type(startDateInput, '2026-04-01');

    const endDateInput = screen.getByLabelText('PIP end date');
    await userEvent.type(endDateInput, '2026-06-30');

    const submitButton = screen.getByRole('button', { name: /Create PIP/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInitiatePIP).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'emp2',
          goalIds: ['goal1', 'goal2', 'goal3'],
          startDate: '2026-04-01',
          endDate: '2026-06-30',
        })
      );
    });
  });

  it('records PIP outcome', async () => {
    mockRecordPIPOutcome.mockResolvedValue({});
    render(<PIPManagement />);

    const recordButton = screen.getByRole('button', { name: /Record Outcome/i });
    await userEvent.click(recordButton);

    const outcomeSelect = screen.getByLabelText('Outcome');
    await userEvent.click(outcomeSelect);
    await userEvent.click(screen.getByText('Completed'));

    const notesInput = screen.getByLabelText('Outcome notes');
    await userEvent.type(notesInput, 'Employee has successfully completed the PIP');

    const submitButton = screen.getByRole('button', { name: /Record Outcome/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRecordPIPOutcome).toHaveBeenCalledWith(
        'pip1',
        'Completed',
        'Employee has successfully completed the PIP'
      );
    });
  });

  it('displays success message after operation', async () => {
    mockInitiatePIP.mockResolvedValue({});
    render(<PIPManagement />);

    const createButton = screen.getByRole('button', { name: /Create PIP/i });
    await userEvent.click(createButton);

    const employeeIdInput = screen.getByLabelText('Employee ID');
    await userEvent.type(employeeIdInput, 'emp2');

    const goalIdsInput = screen.getByLabelText('Goal IDs (comma-separated)');
    await userEvent.type(goalIdsInput, 'goal1');

    const startDateInput = screen.getByLabelText('PIP start date');
    await userEvent.type(startDateInput, '2026-04-01');

    const endDateInput = screen.getByLabelText('PIP end date');
    await userEvent.type(endDateInput, '2026-06-30');

    const submitButton = screen.getByRole('button', { name: /Create PIP/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('PIP created successfully')).toBeInTheDocument();
    });
  });

  it('displays empty state when no PIPs exist', () => {
    (usePerformanceStore as any).mockReturnValue({
      pips: [],
      loadingPIPs: false,
      fetchActivePIPs: mockFetchActivePIPs,
      initiatePIP: mockInitiatePIP,
      recordPIPOutcome: mockRecordPIPOutcome,
      error: null,
      clearError: mockClearError,
    });

    render(<PIPManagement />);
    expect(screen.getByText('No active PIPs')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (usePerformanceStore as any).mockReturnValue({
      pips: [],
      loadingPIPs: true,
      fetchActivePIPs: mockFetchActivePIPs,
      initiatePIP: mockInitiatePIP,
      recordPIPOutcome: mockRecordPIPOutcome,
      error: null,
      clearError: mockClearError,
    });

    render(<PIPManagement />);
    expect(screen.getByText('Loading PIPs...')).toBeInTheDocument();
  });

  it('validates date range', async () => {
    render(<PIPManagement />);

    const createButton = screen.getByRole('button', { name: /Create PIP/i });
    await userEvent.click(createButton);

    const employeeIdInput = screen.getByLabelText('Employee ID');
    await userEvent.type(employeeIdInput, 'emp2');

    const goalIdsInput = screen.getByLabelText('Goal IDs (comma-separated)');
    await userEvent.type(goalIdsInput, 'goal1');

    const startDateInput = screen.getByLabelText('PIP start date');
    await userEvent.type(startDateInput, '2026-06-30');

    const endDateInput = screen.getByLabelText('PIP end date');
    await userEvent.type(endDateInput, '2026-04-01');

    const submitButton = screen.getByRole('button', { name: /Create PIP/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInitiatePIP).not.toHaveBeenCalled();
    });
  });

  it('displays different outcome options', async () => {
    mockRecordPIPOutcome.mockResolvedValue({});
    render(<PIPManagement />);

    const recordButton = screen.getByRole('button', { name: /Record Outcome/i });
    await userEvent.click(recordButton);

    const outcomeSelect = screen.getByLabelText('Outcome');
    await userEvent.click(outcomeSelect);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Extended')).toBeInTheDocument();
    expect(screen.getByText('Escalated')).toBeInTheDocument();
  });
});
