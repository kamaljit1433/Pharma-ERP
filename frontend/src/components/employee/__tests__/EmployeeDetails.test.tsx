import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmployeeDetails } from '../EmployeeDetails';

describe('EmployeeDetails Component', () => {
  const mockEmployee = {
    id: '1',
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@company.com',
    phone: '555-1234',
    personal_email: 'john@personal.com',
    date_of_birth: '1990-01-15',
    gender: 'male',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
    department_id: 'dept-1',
    designation_id: 'des-1',
    employment_type: 'permanent' as const,
    status: 'active' as const,
    date_of_joining: '2024-01-01',
  };

  it('should render employee details', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display employee ID', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('EMP001')).toBeInTheDocument();
  });

  it('should display employee status badge', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should display contact information section', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('john@company.com')).toBeInTheDocument();
    expect(screen.getByText('john@personal.com')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
  });

  it('should display employment information section', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('Employment Information')).toBeInTheDocument();
    expect(screen.getByText('Permanent')).toBeInTheDocument();
  });

  it('should display organization section', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('dept-1')).toBeInTheDocument();
    expect(screen.getByText('des-1')).toBeInTheDocument();
  });

  it('should display address information', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
  });

  it('should display date of birth', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('1/15/1990')).toBeInTheDocument();
  });

  it('should display gender', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('should handle missing optional fields', () => {
    const minimalEmployee = {
      id: '1',
      employee_id: 'EMP001',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@company.com',
      employment_type: 'contract' as const,
      status: 'active' as const,
      date_of_joining: '2024-01-01',
    };

    render(<EmployeeDetails employee={minimalEmployee} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@company.com')).toBeInTheDocument();
  });

  it('should display correct status color for different statuses', () => {
    const suspendedEmployee = { ...mockEmployee, status: 'suspended' as const };
    render(<EmployeeDetails employee={suspendedEmployee} />);
    expect(screen.getByText('suspended')).toBeInTheDocument();
  });

  it('should format date of joining correctly', () => {
    render(<EmployeeDetails employee={mockEmployee} />);
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
  });
});
