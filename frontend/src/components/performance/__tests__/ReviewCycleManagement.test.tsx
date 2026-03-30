import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewCycleManagement } from '../ReviewCycleManagement';
import { usePerformanceStore } from '../../../store/performanceStore';
import { vi } from 'vitest';

vi.mock('../../../store/performanceStore');

describe('ReviewCycleManagement Component', () => {
  const mockFetchReviewCycles = vi.fn();
  const mockCreateReviewCycle = vi.fn();
  const mockTransitionCycleStatus = vi.fn();
  const mockDeleteReviewCycle = vi.fn();
  const mockClearError = vi.fn();

  const mockCycles = [
    {
      id: 'cycle1',
      name: 'Q1 2026 Review',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      status: 'Planning' as const,
    },
    {
      id: 'cycle2',
      name: 'Q2 2026 Review',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      status: 'Active' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (usePerformanceStore as any).mockReturnValue({
      reviewCycles: mockCycles,
      loadingCycles: false,
      fetchReviewCycles: mockFetchReviewCycles,
      createReviewCycle: mockCreateReviewCycle,
      transitionCycleStatus: mockTransitionCycleStatus,
      deleteReviewCycle: mockDeleteReviewCycle,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders review cycle management page', () => {
    render(<ReviewCycleManagement />);
    expect(screen.getByText('Review Cycle Management')).toBeInTheDocument();
  });

  it('displays list of review cycles', () => {
    render(<ReviewCycleManagement />);
    expect(screen.getByText('Q1 2026 Review')).toBeInTheDocument();
    expect(screen.getByText('Q2 2026 Review')).toBeInTheDocument();
  });

  it('displays cycle status badges', () => {
    render(<ReviewCycleManagement />);
    expect(screen.getByText('Planning')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('opens create cycle dialog', async () => {
    render(<ReviewCycleManagement />);
    const createButton = screen.getByRole('button', { name: /Create Cycle/i });
    await userEvent.click(createButton);
    expect(screen.getByText('Create Review Cycle')).toBeInTheDocument();
  });

  it('creates new review cycle', async () => {
    mockCreateReviewCycle.mockResolvedValue({});
    render(<ReviewCycleManagement />);

    const createButton = screen.getByRole('button', { name: /Create Cycle/i });
    await userEvent.click(createButton);

    const nameInput = screen.getByLabelText('Cycle Name');
    await userEvent.type(nameInput, 'Q3 2026 Review');

    const startDateInput = screen.getByLabelText('Cycle start date');
    await userEvent.type(startDateInput, '2026-07-01');

    const endDateInput = screen.getByLabelText('Cycle end date');
    await userEvent.type(endDateInput, '2026-09-30');

    const submitButton = screen.getByRole('button', { name: /Create Cycle/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateReviewCycle).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Q3 2026 Review',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
        })
      );
    });
  });

  it('transitions cycle status', async () => {
    mockTransitionCycleStatus.mockResolvedValue({});
    render(<ReviewCycleManagement />);

    const moveButton = screen.getByRole('button', { name: /Move to Active/i });
    await userEvent.click(moveButton);

    await waitFor(() => {
      expect(mockTransitionCycleStatus).toHaveBeenCalledWith('cycle1', 'Active');
    });
  });

  it('deletes review cycle', async () => {
    mockDeleteReviewCycle.mockResolvedValue({});
    render(<ReviewCycleManagement />);

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await userEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /Delete/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteReviewCycle).toHaveBeenCalled();
    });
  });

  it('displays success message after operation', async () => {
    mockCreateReviewCycle.mockResolvedValue({});
    render(<ReviewCycleManagement />);

    const createButton = screen.getByRole('button', { name: /Create Cycle/i });
    await userEvent.click(createButton);

    const nameInput = screen.getByLabelText('Cycle Name');
    await userEvent.type(nameInput, 'Q3 2026 Review');

    const startDateInput = screen.getByLabelText('Cycle start date');
    await userEvent.type(startDateInput, '2026-07-01');

    const endDateInput = screen.getByLabelText('Cycle end date');
    await userEvent.type(endDateInput, '2026-09-30');

    const submitButton = screen.getByRole('button', { name: /Create Cycle/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Cycle created successfully')).toBeInTheDocument();
    });
  });

  it('displays empty state when no cycles exist', () => {
    (usePerformanceStore as any).mockReturnValue({
      reviewCycles: [],
      loadingCycles: false,
      fetchReviewCycles: mockFetchReviewCycles,
      createReviewCycle: mockCreateReviewCycle,
      transitionCycleStatus: mockTransitionCycleStatus,
      deleteReviewCycle: mockDeleteReviewCycle,
      error: null,
      clearError: mockClearError,
    });

    render(<ReviewCycleManagement />);
    expect(screen.getByText('No review cycles found')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (usePerformanceStore as any).mockReturnValue({
      reviewCycles: [],
      loadingCycles: true,
      fetchReviewCycles: mockFetchReviewCycles,
      createReviewCycle: mockCreateReviewCycle,
      transitionCycleStatus: mockTransitionCycleStatus,
      deleteReviewCycle: mockDeleteReviewCycle,
      error: null,
      clearError: mockClearError,
    });

    render(<ReviewCycleManagement />);
    expect(screen.getByText('Loading review cycles...')).toBeInTheDocument();
  });

  it('validates date range', async () => {
    render(<ReviewCycleManagement />);

    const createButton = screen.getByRole('button', { name: /Create Cycle/i });
    await userEvent.click(createButton);

    const nameInput = screen.getByLabelText('Cycle Name');
    await userEvent.type(nameInput, 'Invalid Cycle');

    const startDateInput = screen.getByLabelText('Cycle start date');
    await userEvent.type(startDateInput, '2026-09-30');

    const endDateInput = screen.getByLabelText('Cycle end date');
    await userEvent.type(endDateInput, '2026-07-01');

    const submitButton = screen.getByRole('button', { name: /Create Cycle/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateReviewCycle).not.toHaveBeenCalled();
    });
  });
});
