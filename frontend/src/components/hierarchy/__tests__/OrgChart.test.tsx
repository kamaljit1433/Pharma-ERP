import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        isActive: true,
        children: [],
      },
    ],
  },
  totalEmployees: 2,
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

    expect(screen.getByText('2 employees across 2 departments')).toBeInTheDocument();
  });

  it('expands and collapses tree nodes', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const expandButton = screen.getAllByRole('button')[0];
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
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
      expect(screen.getByText('2 employees across 2 departments')).toBeInTheDocument();
    });
  });

  it('renders department badges for each node', async () => {
    vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

    render(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText('Executive')).toBeInTheDocument();
    });
  });
});
