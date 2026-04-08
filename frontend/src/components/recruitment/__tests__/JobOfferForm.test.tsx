import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobOfferForm } from '../JobOfferForm';
import * as recruitmentStore from '../../../store/recruitmentStore';

// Mock the recruitment store
vi.mock('../../../store/recruitmentStore', () => ({
  useRecruitmentStore: vi.fn(),
}));

describe('JobOfferForm', () => {
  const mockGenerateOffer = vi.fn();
  const mockSendOffer = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateOffer.mockResolvedValue({ id: 'offer-123' });
    mockSendOffer.mockResolvedValue({});

    vi.mocked(recruitmentStore.useRecruitmentStore).mockReturnValue({
      generateOffer: mockGenerateOffer,
      sendOffer: mockSendOffer,
      loading: false,
      error: null,
    } as any);
  });

  it('renders the form with all required fields', () => {
    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
      />
    );

    expect(screen.getByText('Create Job Offer')).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Department/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Salary/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Terms & Conditions/)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
      />
    );

    const submitButton = screen.getByRole('button', { name: /Generate Offer Letter/ });
    await user.click(submitButton);

    expect(screen.getByText(/Position is required/)).toBeInTheDocument();
    expect(mockGenerateOffer).not.toHaveBeenCalled();
  });

  it('validates salary is a positive number', async () => {
    const user = userEvent.setup();
    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
      />
    );

    const positionInput = screen.getByLabelText(/Position/);
    const departmentInput = screen.getByLabelText(/Department/);
    const salaryInput = screen.getByLabelText(/Annual Salary/);
    const startDateInput = screen.getByLabelText(/Start Date/);
    const termsInput = screen.getByLabelText(/Terms & Conditions/);

    await user.type(positionInput, 'Senior Developer');
    await user.type(departmentInput, 'Engineering');
    await user.type(salaryInput, '0');
    await user.type(startDateInput, '2024-12-01');
    await user.type(termsInput, 'Standard terms');

    const submitButton = screen.getByRole('button', { name: /Generate Offer Letter/ });
    await user.click(submitButton);

    expect(screen.getByText(/Valid salary is required/)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
      />
    );

    const positionInput = screen.getByLabelText(/Position/);
    const departmentInput = screen.getByLabelText(/Department/);
    const salaryInput = screen.getByLabelText(/Annual Salary/);
    const startDateInput = screen.getByLabelText(/Start Date/);
    const termsInput = screen.getByLabelText(/Terms & Conditions/);

    await user.type(positionInput, 'Senior Developer');
    await user.type(departmentInput, 'Engineering');
    await user.type(salaryInput, '1000000');
    await user.type(startDateInput, '2024-12-01');
    await user.type(termsInput, 'Standard terms and conditions');

    const submitButton = screen.getByRole('button', { name: /Generate Offer Letter/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockGenerateOffer).toHaveBeenCalledWith({
        applicant_id: 'app-123',
        position: 'Senior Developer',
        department: 'Engineering',
        salary: 1000000,
        start_date: expect.any(Date),
        terms: 'Standard terms and conditions',
      });
    });
  });

  it('shows send button after successful offer generation', async () => {
    const user = userEvent.setup();
    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
      />
    );

    const positionInput = screen.getByLabelText(/Position/);
    const departmentInput = screen.getByLabelText(/Department/);
    const salaryInput = screen.getByLabelText(/Annual Salary/);
    const startDateInput = screen.getByLabelText(/Start Date/);
    const termsInput = screen.getByLabelText(/Terms & Conditions/);

    await user.type(positionInput, 'Senior Developer');
    await user.type(departmentInput, 'Engineering');
    await user.type(salaryInput, '1000000');
    await user.type(startDateInput, '2024-12-01');
    await user.type(termsInput, 'Standard terms');

    const submitButton = screen.getByRole('button', { name: /Generate Offer Letter/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Offer Letter/ })).toBeInTheDocument();
    });
  });

  it('sends offer letter when send button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
        onSuccess={mockOnSuccess}
      />
    );

    const positionInput = screen.getByLabelText(/Position/);
    const departmentInput = screen.getByLabelText(/Department/);
    const salaryInput = screen.getByLabelText(/Annual Salary/);
    const startDateInput = screen.getByLabelText(/Start Date/);
    const termsInput = screen.getByLabelText(/Terms & Conditions/);

    await user.type(positionInput, 'Senior Developer');
    await user.type(departmentInput, 'Engineering');
    await user.type(salaryInput, '1000000');
    await user.type(startDateInput, '2024-12-01');
    await user.type(termsInput, 'Standard terms');

    const submitButton = screen.getByRole('button', { name: /Generate Offer Letter/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Offer Letter/ })).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /Send Offer Letter/ });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockSendOffer).toHaveBeenCalledWith('offer-123');
    });
  });

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    mockGenerateOffer.mockRejectedValueOnce(new Error('API Error'));

    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
      />
    );

    const positionInput = screen.getByLabelText(/Position/);
    const departmentInput = screen.getByLabelText(/Department/);
    const salaryInput = screen.getByLabelText(/Annual Salary/);
    const startDateInput = screen.getByLabelText(/Start Date/);
    const termsInput = screen.getByLabelText(/Terms & Conditions/);

    await user.type(positionInput, 'Senior Developer');
    await user.type(departmentInput, 'Engineering');
    await user.type(salaryInput, '1000000');
    await user.type(startDateInput, '2024-12-01');
    await user.type(termsInput, 'Standard terms');

    const submitButton = screen.getByRole('button', { name: /Generate Offer Letter/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form inputs while loading', () => {
    vi.mocked(recruitmentStore.useRecruitmentStore).mockReturnValue({
      generateOffer: mockGenerateOffer,
      sendOffer: mockSendOffer,
      loading: true,
      error: null,
    } as any);

    render(
      <JobOfferForm
        applicantId="app-123"
        applicantName="John Doe"
        applicantEmail="john@example.com"
      />
    );

    expect(screen.getByLabelText(/Position/)).toBeDisabled();
    expect(screen.getByLabelText(/Department/)).toBeDisabled();
    expect(screen.getByLabelText(/Annual Salary/)).toBeDisabled();
    expect(screen.getByLabelText(/Start Date/)).toBeDisabled();
    expect(screen.getByLabelText(/Terms & Conditions/)).toBeDisabled();
  });
});
