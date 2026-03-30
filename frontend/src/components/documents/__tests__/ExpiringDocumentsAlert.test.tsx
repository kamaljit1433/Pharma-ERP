import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExpiringDocumentsAlert } from '../ExpiringDocumentsAlert';
import * as documentService from '../../../services/documentService';

vi.mock('../../../services/documentService');

describe('ExpiringDocumentsAlert Component', () => {
  const mockExpiringDocuments = [
    {
      id: '1',
      employee_id: 'emp1',
      employee_name: 'John Doe',
      document_name: 'Passport',
      category: 'Passport',
      expiry_date: '2024-02-15',
      days_until_expiry: 5,
      status: 'verified',
    },
    {
      id: '2',
      employee_id: 'emp1',
      employee_name: 'John Doe',
      document_name: 'Visa',
      category: 'Visa/Work Permit',
      expiry_date: '2024-03-01',
      days_until_expiry: 20,
      status: 'verified',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render expiring documents alert', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Documents Expiring Soon')).toBeInTheDocument();
    });
  });

  it('should display expiring documents list', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Passport')).toBeInTheDocument();
      expect(screen.getByText('Visa')).toBeInTheDocument();
    });
  });

  it('should show urgency badges based on days until expiry', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(screen.getByText('Upcoming')).toBeInTheDocument();
    });
  });

  it('should show success message when no expiring documents', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue([]);

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('All documents are up to date')).toBeInTheDocument();
    });
  });

  it('should display days remaining for each document', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('5 days')).toBeInTheDocument();
      expect(screen.getByText('20 days')).toBeInTheDocument();
    });
  });

  it('should allow threshold selection', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      const thresholdSelect = screen.getByDisplayValue('30 days');
      expect(thresholdSelect).toBeInTheDocument();
    });
  });

  it('should update documents when threshold changes', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      const thresholdSelect = screen.getByDisplayValue('30 days');
      fireEvent.change(thresholdSelect, { target: { value: '7' } });
    });

    await waitFor(() => {
      expect(documentService.documentService.getEmployeeExpiringDocuments).toHaveBeenCalledWith(
        'emp1',
        7
      );
    });
  });

  it('should display admin view with employee names', async () => {
    (documentService.documentService.getExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert isAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display expiry management tips', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue([]);

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Expiry Management Tips')).toBeInTheDocument();
      expect(screen.getByText(/Upload renewed documents before expiry/)).toBeInTheDocument();
    });
  });

  it('should have refresh button', async () => {
    (documentService.documentService.getEmployeeExpiringDocuments as any).mockResolvedValue(
      mockExpiringDocuments
    );

    render(<ExpiringDocumentsAlert employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });
});
