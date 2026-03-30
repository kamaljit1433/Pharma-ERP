import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResignationForm } from '../ResignationForm';

describe('ResignationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render resignation form with all required fields', () => {
    render(
      <ResignationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Submit Resignation')).toBeInTheDocument();
    expect(screen.getByLabelText(/Resignation Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Working Day/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason for Resignation/i)).toBeInTheDocument();
  });

  it('should validate that last working day is after resignation date', async () => {
    const user = userEvent.setup();
    render(
      <ResignationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const resignationDateInput = screen.getByLabelText(/Resignation Date/i);
    const lastWorkingDayInput = screen.getByLabelText(/Last Working Day/i);
    const submitButton = screen.getByRole('button', { name: /Submit Resignation/i });

    // Set resignation date to today
    await user.type(resignationDateInput, '2024-01-15');
    // Set last working day to before resignation date
    await user.type(lastWorkingDayInput, '2024-01-10');

    await user.click(submitButton);

    expect(screen.getByText(/Last working day must be after resignation date/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ResignationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const resignationDateInput = screen.getByLabelText(/Resignation Date/i);
    const lastWorkingDayInput = screen.getByLabelText(/Last Working Day/i);
    const reasonInput = screen.getByLabelText(/Reason for Resignation/i);
    const submitButton = screen.getByRole('button', { name: /Submit Resignation/i });

    await user.type(resignationDateInput, '2024-01-15');
    await user.type(lastWorkingDayInput, '2024-02-15');
    await user.type(reasonInput, 'Better opportunity elsewhere');

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(screen.getByText(/Resignation submitted successfully/i)).toBeInTheDocument();
    });
  });

  it('should display loading state while submitting', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <ResignationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submitting/i });
    expect(submitButton).toBeDisabled();
  });

  it('should display error message on submission failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to submit resignation';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    render(
      <ResignationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const resignationDateInput = screen.getByLabelText(/Resignation Date/i);
    const lastWorkingDayInput = screen.getByLabelText(/Last Working Day/i);
    const submitButton = screen.getByRole('button', { name: /Submit Resignation/i });

    await userEvent.type(resignationDateInput, '2024-01-15');
    await userEvent.type(lastWorkingDayInput, '2024-02-15');

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display next steps information', () => {
    render(
      <ResignationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/What happens next/i)).toBeInTheDocument();
    expect(screen.getByText(/Your resignation will be reviewed by HR/i)).toBeInTheDocument();
    expect(screen.getByText(/An exit interview will be scheduled/i)).toBeInTheDocument();
  });
});
