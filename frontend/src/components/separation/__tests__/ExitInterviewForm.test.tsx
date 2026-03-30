import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExitInterviewForm } from '../ExitInterviewForm';

describe('ExitInterviewForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render exit interview form', () => {
    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/Exit Interview Form/i)).toBeInTheDocument();
  });

  it('should display all questionnaire questions', () => {
    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/What was your overall experience working with us/i)).toBeInTheDocument();
    expect(screen.getByText(/How would you rate your manager and team/i)).toBeInTheDocument();
    expect(screen.getByText(/What could we improve as an organization/i)).toBeInTheDocument();
    expect(screen.getByText(/Would you recommend us as an employer/i)).toBeInTheDocument();
    expect(screen.getByText(/Any final comments or suggestions/i)).toBeInTheDocument();
  });

  it('should validate that conducted_by is required', async () => {
    const user = userEvent.setup();
    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
      />
    );

    const feedbackInput = screen.getByLabelText(/Overall Feedback & Comments/i);
    const submitButton = screen.getByRole('button', { name: /Submit Exit Interview/i });

    await user.type(feedbackInput, 'Good feedback');
    await user.click(submitButton);

    expect(screen.getByText(/Conducted by field is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate that feedback is required', async () => {
    const user = userEvent.setup();
    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
      />
    );

    const conductedByInput = screen.getByPlaceholderText(/e.g., HR-EMP-001/i);
    const submitButton = screen.getByRole('button', { name: /Submit Exit Interview/i });

    await user.type(conductedByInput, 'HR-EMP-001');
    await user.click(submitButton);

    expect(screen.getByText(/Feedback is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
      />
    );

    const conductedByInput = screen.getByPlaceholderText(/e.g., HR-EMP-001/i);
    const feedbackInput = screen.getByLabelText(/Overall Feedback & Comments/i);
    const submitButton = screen.getByRole('button', { name: /Submit Exit Interview/i });

    await user.type(conductedByInput, 'HR-EMP-001');
    await user.type(feedbackInput, 'Positive experience overall');

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(screen.getByText(/Exit interview submitted successfully/i)).toBeInTheDocument();
    });
  });

  it('should allow filling questionnaire responses', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
      />
    );

    const textareas = screen.getAllByPlaceholderText(/Please provide your response/i);
    expect(textareas.length).toBeGreaterThan(0);

    await user.type(textareas[0], 'Great experience');
  });

  it('should display error message on submission failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to submit exit interview';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
      />
    );

    const conductedByInput = screen.getByPlaceholderText(/e.g., HR-EMP-001/i);
    const feedbackInput = screen.getByLabelText(/Overall Feedback & Comments/i);
    const submitButton = screen.getByRole('button', { name: /Submit Exit Interview/i });

    await user.type(conductedByInput, 'HR-EMP-001');
    await user.type(feedbackInput, 'Feedback');

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display loading state while submitting', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <ExitInterviewForm
        exitInterviewId="EXIT001"
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submitting/i });
    expect(submitButton).toBeDisabled();
  });
});
