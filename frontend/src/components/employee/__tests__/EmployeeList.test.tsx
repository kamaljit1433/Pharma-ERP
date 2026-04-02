import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeList, Employee } from '../EmployeeList';

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    employment_type: 'permanent',
    status: 'active',
    date_of_joining: '2023-01-15',
  },
  {
    id: '2',
    employee_id: 'EMP002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    employment_type: 'contract',
    status: 'active',
    date_of_joining: '2023-06-20',
  },
  {
    id: '3',
    employee_id: 'EMP003',
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob@example.com',
    employment_type: 'temporary',
    status: 'on_leave',
    date_of_joining: '2023-03-10',
  },
];

describe('EmployeeList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render employee table with headers', () => {
      render(<EmployeeList employees={mockEmployees} />);

      expect(screen.getByText('Employee ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Employment Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Joining Date')).toBeInTheDocument();
    });

    it('should render all employees in the table', () => {
      render(<EmployeeList employees={mockEmployees} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<EmployeeList employees={[]} loading={true} />);

      expect(screen.getByText('Loading employees...')).toBeInTheDocument();
    });

    it('should display empty state when no employees', () => {
      render(<EmployeeList employees={[]} />);

      expect(screen.getByText('No employees found')).toBeInTheDocument();
    });

    it('should display correct status badges', () => {
      render(<EmployeeList employees={mockEmployees} />);

      const activeBadges = screen.getAllByText('active');
      const onLeaveBadges = screen.getAllByText('on leave');

      expect(activeBadges.length).toBeGreaterThan(0);
      expect(onLeaveBadges.length).toBeGreaterThan(0);
    });

    it('should display employment type labels correctly', () => {
      render(<EmployeeList employees={mockEmployees} />);

      expect(screen.getByText('Permanent')).toBeInTheDocument();
      expect(screen.getByText('Contract')).toBeInTheDocument();
      expect(screen.getByText('Temporary')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter employees by name', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'John');

      // Wait for debounce
      await waitFor(
        () => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should filter employees by email', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'jane@example.com');

      await waitFor(
        () => {
          expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should filter employees by employee ID', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'EMP001');

      await waitFor(
        () => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should show no results message when search returns empty', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'NonExistent');

      await waitFor(
        () => {
          expect(screen.getByText('No employees match your filters')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should debounce search input', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<EmployeeList employees={mockEmployees} onFilterChange={onFilterChange} />);

      const searchInput = screen.getByPlaceholderText(/search by name/i);

      // Type multiple characters quickly
      await user.type(searchInput, 'John', { delay: 50 });

      // onFilterChange should not be called immediately for each keystroke
      // It should be debounced
      expect(onFilterChange).not.toHaveBeenCalledWith(
        expect.objectContaining({ search: 'J' })
      );
    });
  });

  describe('Filtering', () => {
    it('should filter employees by status', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'on_leave');

      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should filter employees by employment type', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const typeSelect = screen.getByDisplayValue('All Types');
      await user.selectOptions(typeSelect, 'permanent');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should combine multiple filters', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      const typeSelect = screen.getByDisplayValue('All Types');

      await user.selectOptions(statusSelect, 'active');
      await user.selectOptions(typeSelect, 'contract');

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
      });
    });

    it('should call onFilterChange when filters change', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<EmployeeList employees={mockEmployees} onFilterChange={onFilterChange} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'active');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'active' })
        );
      });
    });
  });

  describe('Sorting', () => {
    it('should sort employees by name ascending', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // Skip header row
      expect(rows[1]).toHaveTextContent('Bob Johnson');
      expect(rows[2]).toHaveTextContent('Jane Smith');
      expect(rows[3]).toHaveTextContent('John Doe');
    });

    it('should sort employees by name descending', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);
      await user.click(nameHeader); // Click again to reverse

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('John Doe');
      expect(rows[2]).toHaveTextContent('Jane Smith');
      expect(rows[3]).toHaveTextContent('Bob Johnson');
    });

    it('should sort employees by employee ID', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const idHeader = screen.getByText('Employee ID');
      await user.click(idHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('EMP001');
      expect(rows[2]).toHaveTextContent('EMP002');
      expect(rows[3]).toHaveTextContent('EMP003');
    });

    it('should sort employees by joining date', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const dateHeader = screen.getByText('Joining Date');
      await user.click(dateHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('John Doe'); // 2023-01-15
      expect(rows[2]).toHaveTextContent('Bob Johnson'); // 2023-03-10
      expect(rows[3]).toHaveTextContent('Jane Smith'); // 2023-06-20
    });

    it('should display sort indicator', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      // Should show sort indicator (↑ for ascending)
      expect(nameHeader.textContent).toContain('↑');
    });
  });

  describe('Pagination', () => {
    it('should paginate employees', () => {
      const manyEmployees = Array.from({ length: 25 }, (_, i) => ({
        ...mockEmployees[0],
        id: `${i}`,
        employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
        first_name: `Employee${i}`,
      }));

      render(<EmployeeList employees={manyEmployees} />);

      // Should show pagination controls
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      const manyEmployees = Array.from({ length: 25 }, (_, i) => ({
        ...mockEmployees[0],
        id: `${i}`,
        employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
        first_name: `Employee${i}`,
      }));

      render(<EmployeeList employees={manyEmployees} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      const manyEmployees = Array.from({ length: 25 }, (_, i) => ({
        ...mockEmployees[0],
        id: `${i}`,
        employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
        first_name: `Employee${i}`,
      }));

      render(<EmployeeList employees={manyEmployees} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      const manyEmployees = Array.from({ length: 25 }, (_, i) => ({
        ...mockEmployees[0],
        id: `${i}`,
        employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
        first_name: `Employee${i}`,
      }));

      render(<EmployeeList employees={manyEmployees} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      const user = userEvent.setup();
      const manyEmployees = Array.from({ length: 25 }, (_, i) => ({
        ...mockEmployees[0],
        id: `${i}`,
        employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
        first_name: `Employee${i}`,
      }));

      render(<EmployeeList employees={manyEmployees} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      expect(nextButton).toBeDisabled();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<EmployeeList employees={mockEmployees} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith('1');
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<EmployeeList employees={mockEmployees} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('should not show edit button when onEdit is not provided', () => {
      render(<EmployeeList employees={mockEmployees} />);

      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBe(0);
    });

    it('should not show delete button when onDelete is not provided', () => {
      render(<EmployeeList employees={mockEmployees} />);

      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EmployeeList employees={mockEmployees} />);

      expect(screen.getByLabelText(/search employees/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by employment type/i)).toBeInTheDocument();
    });

    it('should have proper button labels for actions', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      render(
        <EmployeeList
          employees={mockEmployees}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      expect(screen.getByLabelText(/edit john doe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delete john doe/i)).toBeInTheDocument();
    });
  });

  describe('Results Count', () => {
    it('should display correct results count', () => {
      render(<EmployeeList employees={mockEmployees} />);

      expect(screen.getByText(/showing 1 to 3 of 3 employees/i)).toBeInTheDocument();
    });

    it('should update results count when filtering', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'active');

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 2 of 2 employees/i)).toBeInTheDocument();
      });
    });
  });
});
