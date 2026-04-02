import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeImportExport } from '../EmployeeImportExport';
import employeeService from '@/services/employeeService';

// Mock the employee service
vi.mock('@/services/employeeService', () => ({
  default: {
    importCSV: vi.fn(),
  },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('EmployeeImportExport Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Import Section', () => {
    it('should render import section', () => {
      render(<EmployeeImportExport />);

      expect(screen.getByText('Import Employees')).toBeInTheDocument();
      expect(screen.getByText(/Upload a CSV file/i)).toBeInTheDocument();
    });

    it('should have file input button', () => {
      render(<EmployeeImportExport />);

      const selectButton = screen.getByRole('button', { name: /select csv file/i });
      expect(selectButton).toBeInTheDocument();
    });

    it('should have download template button', () => {
      render(<EmployeeImportExport />);

      const templateButton = screen.getByRole('button', { name: /download template/i });
      expect(templateButton).toBeInTheDocument();
    });

    it('should show error for non-CSV file', async () => {
      const user = userEvent.setup();
      render(<EmployeeImportExport />);

      const selectButton = screen.getByRole('button', { name: /select csv file/i });
      const fileInput = screen.getByLabelText(/select csv file for import/i);

      // Create a non-CSV file
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/please select a csv file/i)).toBeInTheDocument();
      });
    });

    it('should show error for file larger than 5MB', async () => {
      const user = userEvent.setup();
      render(<EmployeeImportExport />);

      const fileInput = screen.getByLabelText(/select csv file for import/i);

      // Create a file larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.csv', { type: 'text/csv' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
      });
    });

    it('should handle successful import', async () => {
      const user = userEvent.setup();
      const onImportComplete = vi.fn();

      vi.mocked(employeeService.importCSV).mockResolvedValueOnce({
        success: 2,
        failed: 0,
        errors: [],
      });

      render(<EmployeeImportExport onImportComplete={onImportComplete} />);

      const fileInput = screen.getByLabelText(/select csv file for import/i);
      const csvContent = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com,2023-01-15,permanent
EMP002,Jane,Smith,jane@example.com,2023-06-20,contract`;

      const file = new File([csvContent], 'employees.csv', { type: 'text/csv' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Successful')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });

      expect(onImportComplete).toHaveBeenCalledWith({
        success: 2,
        failed: 0,
        errors: [],
      });
    });

    it('should handle import with errors', async () => {
      const user = userEvent.setup();

      vi.mocked(employeeService.importCSV).mockResolvedValueOnce({
        success: 1,
        failed: 1,
        errors: [
          {
            row: 3,
            column: 'email',
            message: 'Invalid email format',
          },
        ],
      });

      render(<EmployeeImportExport />);

      const fileInput = screen.getByLabelText(/select csv file for import/i);
      const csvContent = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com,2023-01-15,permanent
EMP002,Jane,Smith,invalid-email,2023-06-20,contract`;

      const file = new File([csvContent], 'employees.csv', { type: 'text/csv' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Successful')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should display error details', async () => {
      const user = userEvent.setup();

      vi.mocked(employeeService.importCSV).mockResolvedValueOnce({
        success: 0,
        failed: 1,
        errors: [
          {
            row: 2,
            column: 'email',
            message: 'Invalid email format',
          },
        ],
      });

      render(<EmployeeImportExport />);

      const fileInput = screen.getByLabelText(/select csv file for import/i);
      const csvContent = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,invalid-email,2023-01-15,permanent`;

      const file = new File([csvContent], 'employees.csv', { type: 'text/csv' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during import', async () => {
      const user = userEvent.setup();

      vi.mocked(employeeService.importCSV).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: 1, failed: 0, errors: [] }), 100))
      );

      render(<EmployeeImportExport />);

      const fileInput = screen.getByLabelText(/select csv file for import/i);
      const csvContent = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com,2023-01-15,permanent`;

      const file = new File([csvContent], 'employees.csv', { type: 'text/csv' });

      await user.upload(fileInput, file);

      // Should show loading state
      expect(screen.getByText(/importing/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Successful')).toBeInTheDocument();
      });
    });

    it('should close import result when close button is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(employeeService.importCSV).mockResolvedValueOnce({
        success: 1,
        failed: 0,
        errors: [],
      });

      render(<EmployeeImportExport />);

      const fileInput = screen.getByLabelText(/select csv file for import/i);
      const csvContent = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com,2023-01-15,permanent`;

      const file = new File([csvContent], 'employees.csv', { type: 'text/csv' });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Successful')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(screen.queryByText('Successful')).not.toBeInTheDocument();
    });
  });

  describe('Export Section', () => {
    it('should render export section', () => {
      render(<EmployeeImportExport />);

      expect(screen.getByText('Export Employees')).toBeInTheDocument();
      expect(screen.getByText(/export all employees/i)).toBeInTheDocument();
    });

    it('should have export button', () => {
      const employees = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
        },
      ];

      render(<EmployeeImportExport employees={employees} />);

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should disable export button when no employees', () => {
      render(<EmployeeImportExport employees={[]} />);

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      expect(exportButton).toBeDisabled();
    });

    it('should show message when no employees to export', () => {
      render(<EmployeeImportExport employees={[]} />);

      expect(screen.getByText(/no employees to export/i)).toBeInTheDocument();
    });

    it('should handle export', async () => {
      const user = userEvent.setup();
      const onExportComplete = vi.fn();

      const employees = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          date_of_birth: '1990-01-15',
          gender: 'male',
          department_id: 'DEPT001',
          designation_id: 'DES001',
          reporting_manager_id: 'EMP000',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          status: 'active',
        },
      ];

      render(
        <EmployeeImportExport
          employees={employees}
          onExportComplete={onExportComplete}
        />
      );

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(onExportComplete).toHaveBeenCalled();
      });
    });

    it('should show loading state during export', async () => {
      const user = userEvent.setup();

      const employees = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          date_of_birth: '1990-01-15',
          gender: 'male',
          department_id: 'DEPT001',
          designation_id: 'DES001',
          reporting_manager_id: 'EMP000',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          status: 'active',
        },
      ];

      render(<EmployeeImportExport employees={employees} />);

      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      // Should show loading state briefly
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });
  });

  describe('Template Download', () => {
    it('should download template when button is clicked', async () => {
      const user = userEvent.setup();

      render(<EmployeeImportExport />);

      const templateButton = screen.getByRole('button', { name: /download template/i });
      await user.click(templateButton);

      // Verify that URL.createObjectURL was called
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EmployeeImportExport />);

      expect(screen.getByLabelText(/select csv file for import/i)).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(<EmployeeImportExport />);

      expect(screen.getByRole('button', { name: /select csv file/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download template/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
    });
  });
});
