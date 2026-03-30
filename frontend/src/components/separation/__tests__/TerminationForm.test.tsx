import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminationForm } from '../TerminationForm';

describe('TerminationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render termination form with all required fields', () => {
    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/Initiate Employee Termination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Termination Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Termination Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason for Termination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Final Settlement Date/i)).toBeInTheDocument();
  });

  it('should have HR-only warning message', () => {
    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/HR-only operation/i)).toBeInTheDocument();
  });

  it('should validate that reason is required', async () => {
    const user = userEvent.setup();
    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Initiate Termination/i });
    await user.click(submitButton);

    expect(screen.getByText(/Reason for termination is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate that final settlement date is after termination date', async () => {
    const user = userEvent.setup();
    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const terminationDateInput = screen.getByLabelText(/Termination Date/i);
    const finalSettlementDateInput = screen.getByLabelText(/Final Settlement Date/i);
    const reasonInput = screen.getByLabelText(/Reason for Termination/i);
    const submitButton = screen.getByRole('button', { name: /Initiate Termination/i });

    await user.type(terminationDateInput, '2024-02-15');
    await user.type(finalSettlementDateInput, '2024-01-15');
    await user.type(reasonInput, 'Performance issues');

    await user.click(submitButton);

    expect(screen.getByText(/Final settlement date must be on or after termination date/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const terminationDateInput = screen.getByLabelText(/Termination Date/i);
    const terminationTypeSelect = screen.getByLabelText(/Termination Type/i);
    const reasonInput = screen.getByLabelText(/Reason for Termination/i);
    const submitButton = screen.getByRole('button', { name: /Initiate Termination/i });

    await user.type(terminationDateInput, '2024-01-15');
    await user.selectOptions(terminationTypeSelect, 'involuntary');
    await user.type(reasonInput, 'Performance issues and misconduct');

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(screen.getByText(/Termination initiated successfully/i)).toBeInTheDocument();
    });
  });

  it('should support different termination types', async () => {
    const user = userEvent.setup();
    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const terminationTypeSelect = screen.getByLabelText(/Termination Type/i);

    expect(screen.getByRole('option', { name: /Involuntary Termination/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Voluntary Termination/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Retirement/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Contract End/i })).toBeInTheDocument();
  });

  it('should display error message on submission failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to submit termination';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    const terminationDateInput = screen.getByLabelText(/Termination Date/i);
    const reasonInput = screen.getByLabelText(/Reason for Termination/i);
    const submitButton = screen.getByRole('button', { name: /Initiate Termination/i });

    await user.type(terminationDateInput, '2024-01-15');
    await user.type(reasonInput, 'Performance issues');

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display termination process steps', () => {
    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/Termination Process/i)).toBeInTheDocument();
    expect(screen.getByText(/Employee status will be updated to "Terminated"/i)).toBeInTheDocument();
    expect(screen.getByText(/Offboarding workflow will be automatically triggered/i)).toBeInTheDocument();
  });

  it('should display important warning', () => {
    render(
      <TerminationForm
        employeeId="EMP001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/⚠️ Important/i)).toBeInTheDocument();
    expect(screen.getByText(/This is a critical HR operation/i)).toBeInTheDocument();
  });
});
