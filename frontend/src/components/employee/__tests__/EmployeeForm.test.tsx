import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeForm } from '../EmployeeForm';

describe('EmployeeForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render employee form', () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
  });

  it('should display all form sections', () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Employment Information')).toBeInTheDocument();
    expect(screen.getByText('Government IDs')).toBeInTheDocument();
  });

  it('should display required field indicators', () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} />);
    const requiredFields = screen.getAllByText(/\*/);
    expect(requiredFields.length).toBeGreaterThan(0);
  });

  it('should validate required fields on submit', async () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} />);
    const submitButton = screen.getByText('Save Employee');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Date of joining is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByPlaceholderText('John');
    const lastNameInput = screen.getByPlaceholderText('Doe');
    const emailInput = screen.getByPlaceholderText('john@company.com');
    const dateInput = screen.getByDisplayValue('');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    const submitButton = screen.getByText('Save Employee');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByPlaceholderText('John');
    const lastNameInput = screen.getByPlaceholderText('Doe');
    const emailInput = screen.getByPlaceholderText('john@company.com');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@company.com' } });

    // Set date of joining
    const dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });

    const submitButton = screen.getByText('Save Employee');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should populate form with initial data', () => {
    const initialData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@company.com',
      phone: '555-1234',
    };

    render(<EmployeeForm onSubmit={mockOnSubmit} initialData={initialData} />);
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@company.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('555-1234')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<EmployeeForm onSubmit={mockOnSubmit} isLoading={true} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
