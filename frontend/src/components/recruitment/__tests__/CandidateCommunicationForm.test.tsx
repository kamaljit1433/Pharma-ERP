import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateCommunicationForm } from '../CandidateCommunicationForm';
import * as recruitmentService from '../../../services/recruitmentService';

// Mock the recruitment service
vi.mock('../../../services/recruitmentService', () => ({
  recruitmentService: {
    sendCommunication: vi.fn(),
  },
}));

describe('CandidateCommunicationForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockApplicantId = 'applicant-123';
  const mockApplicantEmail = 'candidate@example.com';
  const mockApplicantName = 'John Doe';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
      />
    );

    expect(screen.getByText(/send email to candidate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument();
  });

  it('displays candidate information in the description', () => {
    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
      />
    );

    expect(screen.getByText(new RegExp(mockApplicantName))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockApplicantEmail))).toBeInTheDocument();
  });

  it('displays validation error when subject is empty', async () => {
    const user = userEvent.setup();
    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
        onError={mockOnError}
      />
    );

    const bodyInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send email/i });

    // Initially submit button should be disabled
    expect(submitButton).toBeDisabled();

    // Type only in body
    await user.type(bodyInput, 'Test message');

    // Submit button should still be disabled because subject is empty
    expect(submitButton).toBeDisabled();
  });

  it('displays validation error when body is empty', async () => {
    const user = userEvent.setup();
    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
        onError={mockOnError}
      />
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const submitButton = screen.getByRole('button', { name: /send email/i });

    // Type only in subject
    await user.type(subjectInput, 'Test Subject');

    // Submit button should still be disabled because body is empty
    expect(submitButton).toBeDisabled();
  });

  it('successfully sends email with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(recruitmentService.recruitmentService.sendCommunication).mockResolvedValueOnce({
      id: 'comm-123',
      applicant_id: mockApplicantId,
      sender_id: 'user-123',
      sender_name: 'HR Manager',
      subject: 'Interview Scheduled',
      body: 'Your interview is scheduled for tomorrow',
      sent_at: new Date(),
    });

    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const bodyInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send email/i });

    await user.type(subjectInput, 'Interview Scheduled');
    await user.type(bodyInput, 'Your interview is scheduled for tomorrow');
    await user.click(submitButton);

    await waitFor(() => {
      expect(recruitmentService.recruitmentService.sendCommunication).toHaveBeenCalledWith({
        applicant_id: mockApplicantId,
        subject: 'Interview Scheduled',
        body: 'Your interview is scheduled for tomorrow',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(screen.getByText(/email sent successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to send email';
    vi.mocked(recruitmentService.recruitmentService.sendCommunication).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
        onError={mockOnError}
      />
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const bodyInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send email/i });

    await user.type(subjectInput, 'Test Subject');
    await user.type(bodyInput, 'Test message');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    vi.mocked(recruitmentService.recruitmentService.sendCommunication).mockResolvedValueOnce({
      id: 'comm-123',
      applicant_id: mockApplicantId,
      sender_id: 'user-123',
      sender_name: 'HR Manager',
      subject: 'Interview Scheduled',
      body: 'Your interview is scheduled for tomorrow',
      sent_at: new Date(),
    });

    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
        onSuccess={mockOnSuccess}
      />
    );

    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    const bodyInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: /send email/i });

    await user.type(subjectInput, 'Test Subject');
    await user.type(bodyInput, 'Test message');
    await user.click(submitButton);

    await waitFor(() => {
      expect(subjectInput.value).toBe('');
      expect(bodyInput.value).toBe('');
    });
  });

  it('disables submit button when fields are empty', () => {
    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
      />
    );

    const submitButton = screen.getByRole('button', { name: /send email/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when both fields have content', async () => {
    const user = userEvent.setup();
    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
      />
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const bodyInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send email/i });

    await user.type(subjectInput, 'Test Subject');
    await user.type(bodyInput, 'Test message');

    expect(submitButton).not.toBeDisabled();
  });

  it('clears form when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CandidateCommunicationForm
        applicantId={mockApplicantId}
        applicantEmail={mockApplicantEmail}
        applicantName={mockApplicantName}
      />
    );

    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    const bodyInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    const clearButton = screen.getByRole('button', { name: /clear/i });

    await user.type(subjectInput, 'Test Subject');
    await user.type(bodyInput, 'Test message');
    await user.click(clearButton);

    expect(subjectInput.value).toBe('');
    expect(bodyInput.value).toBe('');
  });
});
