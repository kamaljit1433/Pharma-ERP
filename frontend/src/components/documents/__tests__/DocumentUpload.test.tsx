import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUpload } from '../DocumentUpload';
import * as documentService from '../../../services/documentService';

vi.mock('../../../services/documentService');

describe('DocumentUpload Component', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render document upload form', () => {
    render(<DocumentUpload employeeId="emp1" />);

    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByText('Upload New Document')).toBeInTheDocument();
  });

  it('should display file upload area', () => {
    render(<DocumentUpload employeeId="emp1" />);

    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PDF, JPG, PNG, DOCX (Max 10 MB)')).toBeInTheDocument();
  });

  it('should display document categories', () => {
    render(<DocumentUpload employeeId="emp1" />);

    expect(screen.getByText('Document Category *')).toBeInTheDocument();
    const categorySelect = screen.getByDisplayValue('Select a category');
    expect(categorySelect).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<DocumentUpload employeeId="emp1" />);

    const submitButton = screen.getByText('Upload Document');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });

  it('should validate file size', async () => {
    render(<DocumentUpload employeeId="emp1" />);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('File size must be less than 10 MB')).toBeInTheDocument();
    });
  });

  it('should validate file format', async () => {
    render(<DocumentUpload employeeId="emp1" />);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file format/)).toBeInTheDocument();
    });
  });

  it('should accept valid file formats', async () => {
    render(<DocumentUpload employeeId="emp1" />);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    const validFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  it('should submit document with valid data', async () => {
    (documentService.documentService.uploadDocument as any).mockResolvedValue({
      id: '1',
      status: 'pending_review',
    });

    render(<DocumentUpload employeeId="emp1" onSuccess={mockOnSuccess} />);

    // Select file
    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    const validFile = new File(['content'], 'aadhar.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Fill document name
    const nameInput = screen.getByPlaceholderText('e.g., Aadhar Card, Passport');
    fireEvent.change(nameInput, { target: { value: 'Aadhar Card' } });

    // Select category
    const categorySelect = screen.getByDisplayValue('Select a category');
    fireEvent.change(categorySelect, { target: { value: 'Aadhar' } });

    // Submit
    const submitButton = screen.getByText('Upload Document');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Document uploaded successfully. Awaiting HR verification.')).toBeInTheDocument();
    });
  });

  it('should display upload guidelines', () => {
    render(<DocumentUpload employeeId="emp1" />);

    expect(screen.getByText('Upload Guidelines')).toBeInTheDocument();
    expect(screen.getByText(/Supported formats: PDF, JPG, PNG, DOCX/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size: 10 MB/)).toBeInTheDocument();
  });

  it('should allow optional expiry date', async () => {
    render(<DocumentUpload employeeId="emp1" />);

    const expiryInput = screen.getByDisplayValue('');
    expect(expiryInput).toBeInTheDocument();

    const expiryLabel = screen.getByText('Expiry Date (Optional)');
    expect(expiryLabel).toBeInTheDocument();
  });
});
