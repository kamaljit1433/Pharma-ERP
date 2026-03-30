import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmployeeList } from '../EmployeeList';

describe('EmployeeList Component', () => {
  it('should render employee list component', () => {
    render(<EmployeeList />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('should display add employee button', () => {
    render(<EmployeeList />);
    expect(screen.getByText('Add Employee')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<EmployeeList />);
    expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
  });

  it('should display status filter dropdown', () => {
    render(<EmployeeList />);
    expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
  });

  it('should display table headers', () => {
    render(<EmployeeList />);
    expect(screen.getByText('Employee ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Employment Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Joining Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should display empty state message when no employees', () => {
    render(<EmployeeList />);
    expect(screen.getByText('No employees found')).toBeInTheDocument();
  });

  it('should call onAdd when add button is clicked', () => {
    const onAdd = jest.fn();
    render(<EmployeeList onAdd={onAdd} />);
    const addButton = screen.getByText('Add Employee');
    addButton.click();
    expect(onAdd).toHaveBeenCalled();
  });
});
