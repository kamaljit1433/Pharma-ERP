import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BankDetailsForm } from '../BankDetailsForm';
import * as bankDetailsService from '../../../services/bankDetailsService';

vi.mock('../../../services/bankDetailsService');

describe('BankDetailsForm Component', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (bankDetailsService.bankDetailsService.getBankDetails as any).mockResolvedValue([]);
  });

  it('should render bank details form', () => {
    render(<BankDetailsForm employeeId="emp1" />);

    expect(screen.getByText('Bank Account Details')).toBeInTheDocument();
    expect(screen.getByText('Add Bank Account')).toBeInTheDocument();
  });

  it('should display add account button when no accounts exist', () => {
    render(<BankDetailsForm employeeId="emp1" />);

    expect(screen.getByText('No bank accounts added yet')).toBeInTheDocument();
    expect(screen.getByText('Add Bank Account')).toBeInTheDocument();
  });

  it('should show form when add button is clicked', async () => {
    render(<BankDetailsForm employeeId="emp1" />);

    const addButton = screen.getByText('Add Bank Account');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Bank Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., HDFC Bank')).toBeInTheDocument();
    });
  });

  it('should validate account number length', async () => {
    render(<BankDetailsForm employeeId="emp1" />);

    fireEvent.click(screen.getByText('Add Bank Account'));

    const bankNameInput = screen.getByPlaceholderText('e.g., HDFC Bank');
    fireEvent.change(bankNameInput, { target: { value: 'HDFC Bank' } });

    const accountHolderInput = screen.getByPlaceholderText('Full name as per bank records');
    fireEvent.change(accountHolderInput, { target: { value: 'John Doe' } });

    const accountNumberInput = screen.getByPlaceholderText('9-18 digits');
    fireEvent.change(accountNumberInput, { target: { value: '12345' } });

    const ifscInput = screen.getByPlaceholderText('e.g., HDFC0000001');
    fireEvent.change(ifscInput, { target: { value: 'HDFC0000001' } });

    const branchInput = screen.getByPlaceholderText('e.g., Mumbai Main Branch');
    fireEvent.change(branchInput, { target: { value: 'Mumbai' } });

    const submitButton = screen.getByText('Add Account');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account number must be between 9 and 18 digits')).toBeInTheDocument();
    });
  });

  it('should validate IFSC code format', async () => {
    render(<BankDetailsForm employeeId="emp1" />);

    fireEvent.click(screen.getByText('Add Bank Account'));

    const bankNameInput = screen.getByPlaceholderText('e.g., HDFC Bank');
    fireEvent.change(bankNameInput, { target: { value: 'HDFC Bank' } });

    const accountHolderInput = screen.getByPlaceholderText('Full name as per bank records');
    fireEvent.change(accountHolderInput, { target: { value: 'John Doe' } });

    const accountNumberInput = screen.getByPlaceholderText('9-18 digits');
    fireEvent.change(accountNumberInput, { target: { value: '123456789012' } });

    const ifscInput = screen.getByPlaceholderText('e.g., HDFC0000001');
    fireEvent.change(ifscInput, { target: { value: 'INVALID' } });

    const branchInput = screen.getByPlaceholderText('e.g., Mumbai Main Branch');
    fireEvent.change(branchInput, { target: { value: 'Mumbai' } });

    const submitButton = screen.getByText('Add Account');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid IFSC code format')).toBeInTheDocument();
    });
  });

  it('should submit valid bank account', async () => {
    (bankDetailsService.bankDetailsService.addBankAccount as any).mockResolvedValue({
      id: '1',
      status: 'pending_verification',
    });

    render(<BankDetailsForm employeeId="emp1" onSuccess={mockOnSuccess} />);

    fireEvent.click(screen.getByText('Add Bank Account'));

    const bankNameInput = screen.getByPlaceholderText('e.g., HDFC Bank');
    fireEvent.change(bankNameInput, { target: { value: 'HDFC Bank' } });

    const accountHolderInput = screen.getByPlaceholderText('Full name as per bank records');
    fireEvent.change(accountHolderInput, { target: { value: 'John Doe' } });

    const accountNumberInput = screen.getByPlaceholderText('9-18 digits');
    fireEvent.change(accountNumberInput, { target: { value: '123456789012' } });

    const ifscInput = screen.getByPlaceholderText('e.g., HDFC0000001');
    fireEvent.change(ifscInput, { target: { value: 'HDFC0000001' } });

    const branchInput = screen.getByPlaceholderText('e.g., Mumbai Main Branch');
    fireEvent.change(branchInput, { target: { value: 'Mumbai' } });

    const submitButton = screen.getByText('Add Account');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Bank account added successfully. Awaiting verification.')).toBeInTheDocument();
    });
  });

  it('should enforce account limit of 2', async () => {
    (bankDetailsService.bankDetailsService.getBankDetails as any).mockResolvedValue([
      {
        id: '1',
        bank_name: 'HDFC Bank',
        account_holder_name: 'John Doe',
        account_number: '123456789012',
        ifsc_code: 'HDFC0000001',
        branch_name: 'Mumbai',
        account_type: 'savings',
        is_primary: true,
        verified: true,
      },
      {
        id: '2',
        bank_name: 'ICICI Bank',
        account_holder_name: 'John Doe',
        account_number: '987654321098',
        ifsc_code: 'ICIC0000001',
        branch_name: 'Delhi',
        account_type: 'current',
        is_primary: false,
        verified: true,
      },
    ]);

    render(<BankDetailsForm employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.queryByText('Add Bank Account')).not.toBeInTheDocument();
    });
  });

  it('should display important information', () => {
    render(<BankDetailsForm employeeId="emp1" />);

    expect(screen.getByText('Important Information')).toBeInTheDocument();
    expect(screen.getByText(/Your bank details are encrypted/)).toBeInTheDocument();
  });
});
