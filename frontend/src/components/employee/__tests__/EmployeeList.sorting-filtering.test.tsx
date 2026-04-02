import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeList, Employee } from '../EmployeeList';

// Mock useAuthStore
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      role: 'hr_manager',
      email: 'hr@example.com',
    },
  }),
}));

// Mock useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock useDebounce
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const mockEmployees: Employee[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    first_name: 'Alice',
    last_name: 'Anderson',
    email: 'alice@example.com',
    employment_type: 'permanent',
    status: 'active',
    date_of_joining: '2023-01-15',
  },
  {
    id: '2',
    employee_id: 'EMP002',
    first_name: 'Bob',
    last_name: 'Brown',
    email: 'bob@example.com',
    employment_type: 'contract',
    status: 'active',
    date_of_joining: '2023-06-20',
  },
  {
    id: '3',
    employee_id: 'EMP003',
    first_name: 'Charlie',
    last_name: 'Chen',
    email: 'charlie@example.com',
    employment_type: 'temporary',
    status: 'on_leave',
    date_of_joining: '2023-03-10',
  },
  {
    id: '4',
    employee_id: 'EMP004',
    first_name: 'Diana',
    last_name: 'Davis',
    email: 'diana@example.com',
    employment_type: 'permanent',
    status: 'active',
    date_of_joining: '2022-12-01',
  },
];

describe('EmployeeList - Sorting and Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sorting by Name', () => {
    it('should sort employees by name in ascending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // Skip header row
      expect(rows[1]).toHaveTextContent('Alice Anderson');
      expect(rows[2]).toHaveTextContent('Bob Brown');
      expect(rows[3]).toHaveTextContent('Charlie Chen');
      expect(rows[4]).toHaveTextContent('Diana Davis');
    });

    it('should sort employees by name in descending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);
      await user.click(nameHeader); // Click again to reverse

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Diana Davis');
      expect(rows[2]).toHaveTextContent('Charlie Chen');
      expect(rows[3]).toHaveTextContent('Bob Brown');
      expect(rows[4]).toHaveTextContent('Alice Anderson');
    });

    it('should display sort indicator for ascending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      expect(nameHeader.textContent).toContain('↑');
    });

    it('should display sort indicator for descending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);
      await user.click(nameHeader);

      expect(nameHeader.textContent).toContain('↓');
    });
  });

  describe('Sorting by Employee ID', () => {
    it('should sort employees by ID in ascending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const idHeader = screen.getByText('Employee ID');
      await user.click(idHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('EMP001');
      expect(rows[2]).toHaveTextContent('EMP002');
      expect(rows[3]).toHaveTextContent('EMP003');
      expect(rows[4]).toHaveTextContent('EMP004');
    });

    it('should sort employees by ID in descending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const idHeader = screen.getByText('Employee ID');
      await user.click(idHeader);
      await user.click(idHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('EMP004');
      expect(rows[2]).toHaveTextContent('EMP003');
      expect(rows[3]).toHaveTextContent('EMP002');
      expect(rows[4]).toHaveTextContent('EMP001');
    });
  });

  describe('Sorting by Joining Date', () => {
    it('should sort employees by joining date in ascending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const dateHeader = screen.getByText('Joining Date');
      await user.click(dateHeader);

      const rows = screen.getAllByRole('row');
      // Diana (2022-12-01), Alice (2023-01-15), Charlie (2023-03-10), Bob (2023-06-20)
      expect(rows[1]).toHaveTextContent('Diana Davis');
      expect(rows[2]).toHaveTextContent('Alice Anderson');
      expect(rows[3]).toHaveTextContent('Charlie Chen');
      expect(rows[4]).toHaveTextContent('Bob Brown');
    });

    it('should sort employees by joining date in descending order', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const dateHeader = screen.getByText('Joining Date');
      await user.click(dateHeader);
      await user.click(dateHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bob Brown');
      expect(rows[2]).toHaveTextContent('Charlie Chen');
      expect(rows[3]).toHaveTextContent('Alice Anderson');
      expect(rows[4]).toHaveTextContent('Diana Davis');
    });
  });

  describe('Filtering by Status', () => {
    it('should filter employees by active status', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'active');

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.getByText('Bob Brown')).toBeInTheDocument();
        expect(screen.getByText('Diana Davis')).toBeInTheDocument();
        expect(screen.queryByText('Charlie Chen')).not.toBeInTheDocument();
      });
    });

    it('should filter employees by on_leave status', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'on_leave');

      await waitFor(() => {
        expect(screen.getByText('Charlie Chen')).toBeInTheDocument();
        expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
      });
    });

    it('should show correct count when filtering by status', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'active');

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 3 of 3 employees/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering by Employment Type', () => {
    it('should filter employees by permanent employment type', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const typeSelect = screen.getByDisplayValue('All Types');
      await user.selectOptions(typeSelect, 'permanent');

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.getByText('Diana Davis')).toBeInTheDocument();
        expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      });
    });

    it('should filter employees by contract employment type', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const typeSelect = screen.getByDisplayValue('All Types');
      await user.selectOptions(typeSelect, 'contract');

      await waitFor(() => {
        expect(screen.getByText('Bob Brown')).toBeInTheDocument();
        expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
      });
    });

    it('should show correct count when filtering by employment type', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const typeSelect = screen.getByDisplayValue('All Types');
      await user.selectOptions(typeSelect, 'permanent');

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 2 of 2 employees/i)).toBeInTheDocument();
      });
    });
  });

  describe('Combined Filtering', () => {
    it('should combine status and employment type filters', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      const typeSelect = screen.getByDisplayValue('All Types');

      await user.selectOptions(statusSelect, 'active');
      await user.selectOptions(typeSelect, 'permanent');

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.getByText('Diana Davis')).toBeInTheDocument();
        expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Chen')).not.toBeInTheDocument();
      });
    });

    it('should show no results when filters have no matches', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      const typeSelect = screen.getByDisplayValue('All Types');

      await user.selectOptions(statusSelect, 'on_leave');
      await user.selectOptions(typeSelect, 'permanent');

      await waitFor(() => {
        expect(screen.getByText('No employees match your filters')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Reset', () => {
    it('should reset to first page when filters change', async () => {
      const user = userEvent.setup();
      const manyEmployees = Array.from({ length: 25 }, (_, i) => ({
        ...mockEmployees[0],
        id: `${i}`,
        employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
        first_name: `Employee${i}`,
        status: i % 2 === 0 ? 'active' : 'on_leave',
      }));

      render(<EmployeeList employees={manyEmployees} />);

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();

      // Apply filter
      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'active');

      // Should reset to page 1
      await waitFor(() => {
        expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
      });
    });
  });

  describe('Filter Callback', () => {
    it('should call onFilterChange when filters change', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <EmployeeList
          employees={mockEmployees}
          onFilterChange={onFilterChange}
        />
      );

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'active');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'active',
          })
        );
      });
    });

    it('should include search term in filter callback', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <EmployeeList
          employees={mockEmployees}
          onFilterChange={onFilterChange}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'Alice');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Alice',
          })
        );
      });
    });
  });

  describe('Results Count', () => {
    it('should display correct results count', () => {
      render(<EmployeeList employees={mockEmployees} />);

      expect(screen.getByText(/showing 1 to 4 of 4 employees/i)).toBeInTheDocument();
    });

    it('should update results count when filtering', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      await user.selectOptions(statusSelect, 'active');

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 3 of 3 employees/i)).toBeInTheDocument();
      });
    });

    it('should update results count when sorting', async () => {
      const user = userEvent.setup();
      render(<EmployeeList employees={mockEmployees} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      // Count should remain the same, just order changes
      expect(screen.getByText(/showing 1 to 4 of 4 employees/i)).toBeInTheDocument();
    });
  });
});
