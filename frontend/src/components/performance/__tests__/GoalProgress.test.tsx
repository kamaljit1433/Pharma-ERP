import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalProgress } from '../GoalProgress';
import { usePerformanceStore } from '../../../store/performanceStore';
import { vi } from 'vitest';

vi.mock('../../../store/performanceStore');

describe('GoalProgress Component', () => {
  const mockUpdateGoalProgress = vi.fn();
  const mockClearError = vi.fn();

  const mockGoal = {
    id: 'goal1',
    title: 'Increase Sales',
    description: 'Increase sales by 20%',
    type: 'KPI' as const,
    targetValue: 100,
    currentValue: 75,
    unit: 'units',
    weight: 50,
    dueDate: '2026-12-31',
    status: 'On Track' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePerformanceStore as any).mockReturnValue({
      updateGoalProgress: mockUpdateGoalProgress,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders goal progress card', () => {
    render(<GoalProgress goal={mockGoal} />);
    expect(screen.getByText('Increase Sales')).toBeInTheDocument();
    expect(screen.getByText('Increase sales by 20%')).toBeInTheDocument();
  });

  it('displays correct completion percentage', () => {
    render(<GoalProgress goal={mockGoal} />);
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('displays goal values correctly', () => {
    render(<GoalProgress goal={mockGoal} />);
    expect(screen.getByText('75 units')).toBeInTheDocument();
    expect(screen.getByText('100 units')).toBeInTheDocument();
  });

  it('displays status badge', () => {
    render(<GoalProgress goal={mockGoal} />);
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('opens update progress dialog', async () => {
    render(<GoalProgress goal={mockGoal} />);
    const updateButton = screen.getByRole('button', { name: /Update Progress/i });
    await userEvent.click(updateButton);
    expect(screen.getByText('Update Goal Progress')).toBeInTheDocument();
  });

  it('updates progress with valid data', async () => {
    mockUpdateGoalProgress.mockResolvedValue({});
    render(<GoalProgress goal={mockGoal} />);

    const updateButton = screen.getByRole('button', { name: /Update Progress/i });
    await userEvent.click(updateButton);

    const currentValueInput = screen.getByLabelText('Current progress value');
    await userEvent.clear(currentValueInput);
    await userEvent.type(currentValueInput, '85');

    const submitButton = screen.getByRole('button', { name: /Update Progress/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateGoalProgress).toHaveBeenCalledWith('goal1', 85, '');
    });
  });

  it('displays success message after update', async () => {
    mockUpdateGoalProgress.mockResolvedValue({});
    render(<GoalProgress goal={mockGoal} />);

    const updateButton = screen.getByRole('button', { name: /Update Progress/i });
    await userEvent.click(updateButton);

    const currentValueInput = screen.getByLabelText('Current progress value');
    await userEvent.clear(currentValueInput);
    await userEvent.type(currentValueInput, '85');

    const submitButton = screen.getByRole('button', { name: /Update Progress/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Progress updated successfully')).toBeInTheDocument();
    });
  });

  it('calls onProgressUpdate callback', async () => {
    mockUpdateGoalProgress.mockResolvedValue({});
    const onProgressUpdate = vi.fn();
    render(<GoalProgress goal={mockGoal} onProgressUpdate={onProgressUpdate} />);

    const updateButton = screen.getByRole('button', { name: /Update Progress/i });
    await userEvent.click(updateButton);

    const currentValueInput = screen.getByLabelText('Current progress value');
    await userEvent.clear(currentValueInput);
    await userEvent.type(currentValueInput, '85');

    const submitButton = screen.getByRole('button', { name: /Update Progress/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onProgressUpdate).toHaveBeenCalled();
    });
  });

  it('displays different status colors', () => {
    const completedGoal = { ...mockGoal, status: 'Completed' as const };
    const { rerender } = render(<GoalProgress goal={completedGoal} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();

    const atRiskGoal = { ...mockGoal, status: 'At Risk' as const };
    rerender(<GoalProgress goal={atRiskGoal} />);
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });

  it('calculates progress correctly for 100% completion', () => {
    const completedGoal = { ...mockGoal, currentValue: 100 };
    render(<GoalProgress goal={completedGoal} />);
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('handles progress exceeding target', () => {
    const exceededGoal = { ...mockGoal, currentValue: 120 };
    render(<GoalProgress goal={exceededGoal} />);
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });
});
