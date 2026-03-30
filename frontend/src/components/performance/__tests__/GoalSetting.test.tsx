import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalSetting } from '../GoalSetting';
import { usePerformanceStore } from '../../../store/performanceStore';
import { vi } from 'vitest';

vi.mock('../../../store/performanceStore');

describe('GoalSetting Component', () => {
  const mockCreateGoal = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePerformanceStore as any).mockReturnValue({
      createGoal: mockCreateGoal,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders the goal setting form', () => {
    render(<GoalSetting employeeId="emp1" cycleId="cycle1" />);
    expect(screen.getByText('Create Goal')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal Title')).toBeInTheDocument();
  });

  it('validates weight is between 0-100', async () => {
    render(<GoalSetting employeeId="emp1" cycleId="cycle1" />);
    const weightInput = screen.getByLabelText('Goal weight percentage');
    
    await userEvent.clear(weightInput);
    await userEvent.type(weightInput, '150');
    
    expect(weightInput).toHaveValue(150);
  });

  it('validates target value is greater than 0', async () => {
    render(<GoalSetting employeeId="emp1" cycleId="cycle1" />);
    const targetInput = screen.getByLabelText('Target value');
    
    await userEvent.clear(targetInput);
    await userEvent.type(targetInput, '0');
    
    expect(targetInput).toHaveValue(0);
  });

  it('submits form with valid data', async () => {
    mockCreateGoal.mockResolvedValue({});
    render(<GoalSetting employeeId="emp1" cycleId="cycle1" />);

    await userEvent.type(screen.getByLabelText('Goal Title'), 'Increase Sales');
    await userEvent.type(screen.getByLabelText('Goal description'), 'Increase sales by 20%');
    await userEvent.type(screen.getByLabelText('Target value'), '100');
    await userEvent.type(screen.getByLabelText('Measurement unit'), 'units');
    await userEvent.type(screen.getByLabelText('Goal weight percentage'), '50');
    await userEvent.type(screen.getByLabelText('Goal due date'), '2026-12-31');

    const submitButton = screen.getByRole('button', { name: /Create Goal/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'emp1',
          cycleId: 'cycle1',
          title: 'Increase Sales',
          targetValue: 100,
          weight: 50,
        })
      );
    });
  });

  it('displays success message after submission', async () => {
    mockCreateGoal.mockResolvedValue({});
    render(<GoalSetting employeeId="emp1" cycleId="cycle1" />);

    await userEvent.type(screen.getByLabelText('Goal Title'), 'Test Goal');
    await userEvent.type(screen.getByLabelText('Target value'), '50');
    await userEvent.type(screen.getByLabelText('Goal weight percentage'), '25');
    await userEvent.type(screen.getByLabelText('Goal due date'), '2026-12-31');

    await userEvent.click(screen.getByRole('button', { name: /Create Goal/i }));

    await waitFor(() => {
      expect(screen.getByText('Goal created successfully')).toBeInTheDocument();
    });
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Failed to create goal';
    (usePerformanceStore as any).mockReturnValue({
      createGoal: mockCreateGoal,
      error: errorMessage,
      clearError: mockClearError,
    });

    render(<GoalSetting employeeId="emp1" cycleId="cycle1" />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onSuccess callback after successful submission', async () => {
    mockCreateGoal.mockResolvedValue({});
    const onSuccess = vi.fn();
    render(<GoalSetting employeeId="emp1" cycleId="cycle1" onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText('Goal Title'), 'Test Goal');
    await userEvent.type(screen.getByLabelText('Target value'), '50');
    await userEvent.type(screen.getByLabelText('Goal weight percentage'), '25');
    await userEvent.type(screen.getByLabelText('Goal due date'), '2026-12-31');

    await userEvent.click(screen.getByRole('button', { name: /Create Goal/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('resets form after successful submission', async () => {
    mockCreateGoal.mockResolvedValue({});
    render(<GoalSetting employeeId="emp1" cycleId="cycle1" />);

    const titleInput = screen.getByLabelText('Goal Title') as HTMLInputElement;
    await userEvent.type(titleInput, 'Test Goal');
    await userEvent.type(screen.getByLabelText('Target value'), '50');
    await userEvent.type(screen.getByLabelText('Goal weight percentage'), '25');
    await userEvent.type(screen.getByLabelText('Goal due date'), '2026-12-31');

    await userEvent.click(screen.getByRole('button', { name: /Create Goal/i }));

    await waitFor(() => {
      expect(titleInput.value).toBe('');
    });
  });
});
