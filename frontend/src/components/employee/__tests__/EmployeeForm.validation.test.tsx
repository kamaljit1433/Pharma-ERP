import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeForm } from '../EmployeeForm';

describe('EmployeeForm Validation', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Required Field Validation', () => {
    it('should show error for missing first name', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: '',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for missing last name', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: '',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for missing email', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: '',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for missing date of joining', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Date of joining is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Email Validation', () => {
    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'invalid-email',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should accept valid email formats', async () => {
      const user = userEvent.setup();
      const validEmails = [
        'john@example.com',
        'john.doe@example.co.uk',
        'john+tag@example.com',
        'john_doe@example.com',
      ];

      for (const email of validEmails) {
        mockOnSubmit.mockClear();

        render(
          <EmployeeForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            initialData={{
              first_name: 'John',
              last_name: 'Doe',
              email,
              date_of_joining: '2023-01-15',
              employment_type: 'permanent',
            }}
          />
        );

        const submitButton = screen.getByRole('button', { name: /save employee/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });
      }
    });

    it('should reject email without domain', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should reject email with spaces', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john @example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2023-01-15',
        employment_type: 'permanent' as const,
      };

      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={validData}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining(validData));
      });
    });

    it('should not submit form with invalid data', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: '',
            last_name: 'Doe',
            email: 'invalid-email',
            date_of_joining: '',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should clear error when field is corrected', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: '',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      // Submit with error
      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });

      // Fix the error
      const firstNameInput = screen.getByPlaceholderText('John');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'John');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', () => {
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should disable cancel button while loading', () => {
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Form Fields', () => {
    it('should populate form with initial data', () => {
      const initialData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        date_of_birth: '1990-01-15',
        gender: 'male' as const,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        pan: 'ABCDE1234F',
        aadhar: '123456789012',
        department_id: 'DEPT001',
        designation_id: 'DES001',
        date_of_joining: '2023-01-15',
        employment_type: 'permanent' as const,
      };

      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={initialData}
        />
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    });

    it('should update form data when fields are changed', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const firstNameInput = screen.getByDisplayValue('John');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            first_name: 'Jane',
          })
        );
      });
    });

    it('should handle employment type selection', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      const employmentTypeSelect = screen.getByDisplayValue('Permanent');
      await user.selectOptions(employmentTypeSelect, 'contract');

      const submitButton = screen.getByRole('button', { name: /save employee/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            employment_type: 'contract',
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
          }}
        />
      );

      expect(screen.getByText('First Name *')).toBeInTheDocument();
      expect(screen.getByText('Last Name *')).toBeInTheDocument();
      expect(screen.getByText('Work Email *')).toBeInTheDocument();
      expect(screen.getByText('Date of Joining *')).toBeInTheDocument();
    });

    it('should indicate required fields with asterisk', () => {
      render(
        <EmployeeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const requiredLabels = screen.getAllByText(/\*/);
      expect(requiredLabels.length).toBeGreaterThan(0);
    });
  });
});
