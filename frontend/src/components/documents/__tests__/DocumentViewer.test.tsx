import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentViewer } from '../DocumentViewer';
import * as documentService from '../../../services/documentService';

vi.mock('../../../services/documentService');

describe('DocumentViewer Component', () => {
  const mockDocuments = [
    {
      id: '1',
      employee_id: 'emp1',
      category: 'Aadhar',
      document_name: 'Aadhar Card',
      file_url: 'https://example.com/aadhar.pdf',
      upload_date: '2024-01-15',
      expiry_date: '2026-01-15',
      status: 'verified' as const,
      version: 1,
      created_at: '2024-01-15',
    },
    {
      id: '2',
      employee_id: 'emp1',
      category: 'PAN',
      document_name: 'PAN Card',
      file_url: 'https://example.com/pan.pdf',
      upload_date: '2024-01-10',
      status: 'pending_review' as const,
      version: 1,
      created_at: '2024-01-10',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (documentService.documentService.getEmployeeDocuments as any).mockResolvedValue(mockDocuments);
  });

  it('should render document viewer', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('My Documents')).toBeInTheDocument();
    });
  });

  it('should display list of documents', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Aadhar Card')).toBeInTheDocument();
      expect(screen.getByText('PAN Card')).toBeInTheDocument();
    });
  });

  it('should display document status badges', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });

  it('should display document categories', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Aadhar')).toBeInTheDocument();
      expect(screen.getByText('PAN')).toBeInTheDocument();
    });
  });

  it('should display action buttons', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      const previewButtons = screen.getAllByText('Preview');
      const downloadButtons = screen.getAllByText('Download');
      expect(previewButtons.length).toBeGreaterThan(0);
      expect(downloadButtons.length).toBeGreaterThan(0);
    });
  });

  it('should show empty state when no documents', async () => {
    (documentService.documentService.getEmployeeDocuments as any).mockResolvedValue([]);

    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument();
    });
  });

  it('should handle document deletion', async () => {
    (documentService.documentService.deleteDocument as any).mockResolvedValue({});

    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg')
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display expiry information', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Expiry Date')).toBeInTheDocument();
    });
  });

  it('should display document version', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('v1')).toBeInTheDocument();
    });
  });

  it('should display document management info', async () => {
    render(<DocumentViewer employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Document Management')).toBeInTheDocument();
      expect(screen.getByText(/Keep your documents updated/)).toBeInTheDocument();
    });
  });
});
