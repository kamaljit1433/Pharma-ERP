import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReimbursementClaimForm } from '../ReimbursementClaimForm';
import * as benefitsService from '../../../services/benefitsService';

vi.mock('../../../services/benefitsService');

describe('ReimbursementClaimForm Component', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render reimbursement claim form', () => {
    render(<ReimbursementClaimForm employeeId="emp1" />);

    expect(screen.getByText('Submit Reimbursement Claim')).toBeInTheDocument();
    expect(screen.getByText('Claim Details')).toBeInTheDocument();
  });

  it('should display claim type options', () => {
    render(<ReimbursementClaimForm employeeId="emp1" />);

    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText('Meals')).toBeInTheDocument();
    expect(screen.getByText('Accommodation')).toBeInTheDocument();
    expect(screen.getByText('Medical')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should submit claim with valid data', async () => {
    (benefitsService.benefitsService.submitReimbursementClaim as any).mockResolvedValue({
      data: { id: '1', status: 'pending' },
    });

    render(<ReimbursementClaimForm employeeId="emp1" onSuccess={mockOnSuccess} />);

    // Select claim type
    fireEvent.click(screen.getByText('Travel'));

    // Fill amount
    const amountInput = screen.getByPlaceholderText('Enter claim amount');
    fireEvent.change(amountInput, { target: { value: '5000' } });

    // Fill description
    const descriptionInput = screen.getByPlaceholderText(
      'Describe the expense and reason for reimbursement'
    );
    fireEvent.change(descriptionInput, { target: { value: 'Travel to client site' } });

    // Submit
    const submitButton = screen.getByText('Submit Claim');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Reimbursement claim submitted successfully')).toBeInTheDocument();
    });
  });

  it('should show error for missing fields', async () => {
    render(<ReimbursementClaimForm employeeId="emp1" />);

    const submitButton = screen.getByText('Submit Claim');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });

  it('should show error for invalid amount', async () => {
    render(<ReimbursementClaimForm employeeId="emp1" />);

    fireEvent.click(screen.getByText('Travel'));

    const amountInput = screen.getByPlaceholderText('Enter claim amount');
    fireEvent.change(amountInput, { target: { value: '-100' } });

    const descriptionInput = screen.getByPlaceholderText(
      'Describe the expense and reason for reimbursement'
    );
    fireEvent.change(descriptionInput, { target: { value: 'Travel to client site' } });

    const submitButton = screen.getByText('Submit Claim');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    });
  });

  it('should display important information', () => {
    render(<ReimbursementClaimForm employeeId="emp1" />);

    expect(screen.getByText('Important Information')).toBeInTheDocument();
    expect(screen.getByText(/Claims will be reviewed by your manager/)).toBeInTheDocument();
  });
});
