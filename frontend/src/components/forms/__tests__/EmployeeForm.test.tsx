import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeForm from '../EmployeeForm';
import { useUIStore } from '@/store/uiStore';

// Mock the UI store
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('EmployeeForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore as any).mockReturnValue({
      addToast: mockAddToast,
    });
  });

  describe('Rendering', () => {
    it('should render form with all tabs', () => {
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('tab', { name: /personal/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /employment/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /photo/i })).toBeInTheDocument();
    });

    it('should render required fields in personal tab', () => {
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show validation errors on submit with empty form', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /create employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.click(screen.getByRole('button', { name: /create employee/i }));

      await waitFor(() => {
        // Check for error in error summary or field error
        const errorMessages = screen.queryAllByText(/valid email address/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should validate phone format', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, '123');
      await user.click(screen.getByRole('button', { name: /create employee/i }));

      await waitFor(() => {
        // Check for error in error summary or field error
        const errorMessages = screen.queryAllByText(/valid phone number/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission when validation fails', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /create employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should disable submit button during loading', () => {
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show success toast on successful submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      // Switch to employment tab to access date of joining
      const employmentTab = screen.getByRole('tab', { name: /employment/i });
      await user.click(employmentTab);

      await user.type(screen.getByLabelText(/date of joining/i), '2024-01-15');

      const submitButton = screen.getByRole('button', { name: /create employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'success',
            message: expect.stringContaining('created successfully'),
          })
        );
      });
    });

    it('should show error toast on submission failure', async () => {
      const user = userEvent.setup();
      const error = new Error('Network error');
      mockOnSubmit.mockRejectedValue(error);

      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      // Switch to employment tab to access date of joining
      const employmentTab = screen.getByRole('tab', { name: /employment/i });
      await user.click(employmentTab);

      await user.type(screen.getByLabelText(/date of joining/i), '2024-01-15');

      const submitButton = screen.getByRole('button', { name: /create employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
          })
        );
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const employmentTab = screen.getByRole('tab', { name: /employment/i });
      await user.click(employmentTab);

      expect(screen.getByLabelText(/date of joining/i)).toBeInTheDocument();
    });
  });
});
