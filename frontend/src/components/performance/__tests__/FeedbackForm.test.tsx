import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackForm } from '../FeedbackForm';
import { usePerformanceStore } from '../../../store/performanceStore';
import { vi } from 'vitest';

vi.mock('../../../store/performanceStore');

describe('FeedbackForm Component', () => {
  const mockProvideFeedback = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePerformanceStore as any).mockReturnValue({
      provideFeedback: mockProvideFeedback,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders feedback form', () => {
    render(<FeedbackForm fromEmployeeId="emp1" />);
    expect(screen.getByText('Provide Feedback')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient employee ID')).toBeInTheDocument();
  });

  it('displays feedback type options', async () => {
    render(<FeedbackForm fromEmployeeId="emp1" />);
    const typeSelect = screen.getByLabelText('Feedback Type');
    await userEvent.click(typeSelect);
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Constructive')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });

  it('displays visibility options', async () => {
    render(<FeedbackForm fromEmployeeId="emp1" />);
    const visibilitySelect = screen.getByLabelText('Visibility');
    await userEvent.click(visibilitySelect);
    expect(screen.getByText(/Private/)).toBeInTheDocument();
    expect(screen.getByText(/Manager Only/)).toBeInTheDocument();
    expect(screen.getByText(/Public/)).toBeInTheDocument();
  });

  it('validates content length (minimum 10 characters)', async () => {
    render(<FeedbackForm fromEmployeeId="emp1" />);
    const contentInput = screen.getByLabelText('Feedback content');
    await userEvent.type(contentInput, 'Short');
    expect(screen.getByText('5 / 5000 characters')).toBeInTheDocument();
  });

  it('validates content length (maximum 5000 characters)', async () => {
    render(<FeedbackForm fromEmployeeId="emp1" />);
    const contentInput = screen.getByLabelText('Feedback content');
    const longText = 'a'.repeat(5001);
    await userEvent.type(contentInput, longText);
    expect(screen.getByText('Maximum 5000 characters')).toBeInTheDocument();
  });

  it('submits feedback with valid data', async () => {
    mockProvideFeedback.mockResolvedValue({});
    render(<FeedbackForm fromEmployeeId="emp1" />);

    const employeeIdInput = screen.getByLabelText('Recipient employee ID');
    await userEvent.type(employeeIdInput, 'emp2');

    const typeSelect = screen.getByLabelText('Feedback Type');
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('Positive'));

    const contentInput = screen.getByLabelText('Feedback content');
    await userEvent.type(contentInput, 'Great work on the project!');

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProvideFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          toEmployeeId: 'emp2',
          fromEmployeeId: 'emp1',
          type: 'Positive',
          content: 'Great work on the project!',
        })
      );
    });
  });

  it('displays success message after submission', async () => {
    mockProvideFeedback.mockResolvedValue({});
    render(<FeedbackForm fromEmployeeId="emp1" />);

    const employeeIdInput = screen.getByLabelText('Recipient employee ID');
    await userEvent.type(employeeIdInput, 'emp2');

    const typeSelect = screen.getByLabelText('Feedback Type');
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('Constructive'));

    const contentInput = screen.getByLabelText('Feedback content');
    await userEvent.type(contentInput, 'Consider improving your communication skills');

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Feedback submitted successfully')).toBeInTheDocument();
    });
  });

  it('handles anonymous feedback submission', async () => {
    mockProvideFeedback.mockResolvedValue({});
    render(<FeedbackForm fromEmployeeId="emp1" />);

    const employeeIdInput = screen.getByLabelText('Recipient employee ID');
    await userEvent.type(employeeIdInput, 'emp2');

    const typeSelect = screen.getByLabelText('Feedback Type');
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('Constructive'));

    const contentInput = screen.getByLabelText('Feedback content');
    await userEvent.type(contentInput, 'Anonymous feedback message');

    const anonymousCheckbox = screen.getByLabelText('Submit feedback anonymously');
    await userEvent.click(anonymousCheckbox);

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProvideFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          isAnonymous: true,
        })
      );
    });
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Failed to submit feedback';
    (usePerformanceStore as any).mockReturnValue({
      provideFeedback: mockProvideFeedback,
      error: errorMessage,
      clearError: mockClearError,
    });

    render(<FeedbackForm fromEmployeeId="emp1" />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onSuccess callback after submission', async () => {
    mockProvideFeedback.mockResolvedValue({});
    const onSuccess = vi.fn();
    render(<FeedbackForm fromEmployeeId="emp1" onSuccess={onSuccess} />);

    const employeeIdInput = screen.getByLabelText('Recipient employee ID');
    await userEvent.type(employeeIdInput, 'emp2');

    const typeSelect = screen.getByLabelText('Feedback Type');
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('Positive'));

    const contentInput = screen.getByLabelText('Feedback content');
    await userEvent.type(contentInput, 'Excellent performance!');

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('resets form after successful submission', async () => {
    mockProvideFeedback.mockResolvedValue({});
    render(<FeedbackForm fromEmployeeId="emp1" />);

    const employeeIdInput = screen.getByLabelText('Recipient employee ID') as HTMLInputElement;
    await userEvent.type(employeeIdInput, 'emp2');

    const typeSelect = screen.getByLabelText('Feedback Type');
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('Neutral'));

    const contentInput = screen.getByLabelText('Feedback content') as HTMLTextAreaElement;
    await userEvent.type(contentInput, 'This is feedback');

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(employeeIdInput.value).toBe('');
      expect(contentInput.value).toBe('');
    });
  });

  it('disables submit button when content is invalid', async () => {
    render(<FeedbackForm fromEmployeeId="emp1" />);
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    expect(submitButton).toBeDisabled();

    const contentInput = screen.getByLabelText('Feedback content');
    await userEvent.type(contentInput, 'Short');
    expect(submitButton).toBeDisabled();

    await userEvent.clear(contentInput);
    await userEvent.type(contentInput, 'This is valid feedback content');
    expect(submitButton).not.toBeDisabled();
  });
});
