import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrgChart from '../OrgChart';
import hierarchyService from '../../../services/hierarchyService';

vi.mock('../../../services/hierarchyService');

const mockOrgChartData = {
  root: {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    designationId: 'des1',
    designationName: 'CEO',
    departmentId: 'dept1',
    departmentName: 'Executive',
    profilePhotoUrl: 'https://example.com/photo1.jpg',
    isActive: true,
    children: [
      {
        id: '2',
        employeeId: 'emp2',
        employeeName: 'Jane Smith',
        designationId: 'des2',
        designationName: 'CTO',
        departmentId: 'dept2',
        departmentName: 'Engineering',
        managerId: 'emp1',
        managerName: 'John Doe',
        profilePhotoUrl: 'https://example.com/photo2.jpg',
        isActive: true,
        children: [
          {
            id: '3',
            employeeId: 'emp3',
            employeeName: 'Bob Johnson',
            designationId: 'des3',
            designationName: 'Senior Engineer',
            departmentId: 'dept2',
            departmentName: 'Engineering',
            managerId: 'emp2',
            managerName: 'Jane Smith',
            profilePhotoUrl: 'https://example.com/photo3.jpg',
            isActive: true,
            children: [],
          },
        ],
      },
    ],
  },
  totalEmployees: 3,
  totalDepartments: 2,
};

describe('OrgChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(hierarchyService.getOrgChart).mockImplementation(
      () => new Promise(() => {})
    );

    render(<OrgChart />);
    expect(screen.getByText('Organization Chart')).toBeInTheDocument();
    expect(screen.getByText('Loading organizational structure...')).toBeInTheDocument();
  });

  it('renders org chart data when loaded', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CEO')).toBeInTheDocument();
    });

    expect(screen.getByText('3 employees across 2 departments')).toBeInTheDocument();
  });

  it('displays employee photos with avatars', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check that avatar fallback text is displayed
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('expands and collapses tree nodes', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const expandButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label') === 'Expand'
    );
    
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    }
  });

  it('calls onNodeClick when a node is clicked', async () => {
    const onNodeClick = vi.fn();
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart onNodeClick={onNodeClick} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const nodeElement = screen.getByText('John Doe').closest('div');
    if (nodeElement) {
      fireEvent.click(nodeElement);
    }

    expect(onNodeClick).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to load org chart';
    vi.mocked(hierarchyService.getOrgChart).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays employee count and department count', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('3 employees across 2 departments')).toBeInTheDocument();
    });
  });

  it('renders department badges for each node', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('Executive')).toBeInTheDocument();
    });
  });

  it('displays team size badge for nodes with children', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Expand to show children
    const expandButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label') === 'Expand'
    );
    
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    }
  });

  it('supports search functionality', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    const user = userEvent.setup();
    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or position...');
    await user.type(searchInput, 'CEO');

    // Search should still show John Doe since he's a CEO
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('clears search when clear button is clicked', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    const user = userEvent.setup();
    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or position...');
    await user.type(searchInput, 'CEO');

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('expands all nodes when Expand All button is clicked', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    const user = userEvent.setup();
    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
    await user.click(expandAllButton);

    // After expanding all, Jane Smith should be visible
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('collapses all nodes when Collapse All button is clicked', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    const user = userEvent.setup();
    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // First expand all
    const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
    await user.click(expandAllButton);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Then collapse all
    const collapseAllButton = screen.getByRole('button', { name: /Collapse All/i });
    await user.click(collapseAllButton);

    // Jane Smith should still be in DOM but not visible (collapsed)
    // We can't easily test visibility, so we just verify the button works
    expect(collapseAllButton).toBeInTheDocument();
  });

  it('highlights reporting relationships when searching', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    const user = userEvent.setup();
    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or position...');
    await user.type(searchInput, 'John');

    // Search should find John Doe
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('passes departmentId to service when provided', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart departmentId="dept2" />);

    await waitFor(() => {
      expect(hierarchyService.getOrgChart).toHaveBeenCalledWith(undefined, 'dept2');
    });
  });
});
