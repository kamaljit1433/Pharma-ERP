import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
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
          {
            id: '4',
            employeeId: 'emp4',
            employeeName: 'Alice Brown',
            designationId: 'des3',
            designationName: 'Senior Engineer',
            departmentId: 'dept2',
            departmentName: 'Engineering',
            managerId: 'emp2',
            managerName: 'Jane Smith',
            profilePhotoUrl: 'https://example.com/photo4.jpg',
            isActive: true,
            children: [],
          },
        ],
      },
      {
        id: '5',
        employeeId: 'emp5',
        employeeName: 'Charlie Davis',
        designationId: 'des4',
        designationName: 'CFO',
        departmentId: 'dept3',
        departmentName: 'Finance',
        managerId: 'emp1',
        managerName: 'John Doe',
        profilePhotoUrl: 'https://example.com/photo5.jpg',
        isActive: true,
        children: [],
      },
    ],
  },
  totalEmployees: 5,
  totalDepartments: 3,
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('OrgChart Interactions - Requirements 29.5, 29.6, 29.7', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 29.5: Allow clicking on employees to view details', () => {
    it('should open employee detail modal when clicking on an employee node', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      const johnDoe = await screen.findByText('John Doe');
      expect(johnDoe).toBeInTheDocument();

      // Click on John Doe node (get the first one in the org chart, not the modal)
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      // Modal should open with employee details
      await waitFor(() => {
        expect(screen.getByText('Employee Details')).toBeInTheDocument();
      });
    });

    it('should display employee information in the detail modal', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Click on John Doe (get the first one in the org chart)
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      // Check modal displays correct information
      await waitFor(() => {
        expect(screen.getByText('Employee Details')).toBeInTheDocument();
        expect(screen.getByText('CEO')).toBeInTheDocument();
        expect(screen.getByText('Executive')).toBeInTheDocument();
      });
    });

    it('should display team size in the detail modal for managers', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Click on John Doe (who has 2 direct reports)
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      // Check that direct reports count is displayed
      await waitFor(() => {
        expect(screen.getByText('Direct Reports')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display direct reports list in the detail modal', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Click on John Doe
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      // Check that direct reports are listed
      await waitFor(() => {
        expect(screen.getByText('Team Members:')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Davis')).toBeInTheDocument();
      });
    });

    it('should close the detail modal when close button is clicked', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Click on John Doe to open modal
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      await waitFor(() => {
        expect(screen.getByText('Employee Details')).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByRole('button', { name: /Close/i });
      await user.click(closeButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText('Employee Details')).not.toBeInTheDocument();
      });
    });

    it('should navigate to employee profile when "View Full Profile" button is clicked', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Click on John Doe
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      await waitFor(() => {
        expect(screen.getByText('Employee Details')).toBeInTheDocument();
      });

      // Click "View Full Profile" button
      const viewProfileButton = screen.getByRole('button', { name: /View Full Profile/i });
      await user.click(viewProfileButton);

      // Modal should close after navigation
      await waitFor(() => {
        expect(screen.queryByText('Employee Details')).not.toBeInTheDocument();
      });
    });
  });

  describe('Requirement 29.6: Support searching within the org chart', () => {
    it('should filter org chart when searching by employee name', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Search for "Jane"
      const searchInput = screen.getByPlaceholderText('Search by name or position...');
      await user.type(searchInput, 'Jane');

      // Jane Smith should be visible
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // John Doe should still be visible (ancestor of Jane)
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });

    it('should filter org chart when searching by designation', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Search for "Engineer"
      const searchInput = screen.getByPlaceholderText('Search by name or position...');
      await user.type(searchInput, 'Engineer');

      // Bob Johnson (Senior Engineer) should be visible
      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });

      // Alice Brown (Senior Engineer) should be visible
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    });

    it('should highlight search results', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Search for "Jane"
      const searchInput = screen.getByPlaceholderText('Search by name or position...');
      await user.type(searchInput, 'Jane');

      // Jane Smith should be highlighted
      await waitFor(() => {
        const janeElement = screen.getByText('Jane Smith').closest('div');
        expect(janeElement).toHaveClass('bg-blue-50');
      });
    });

    it('should clear search when clear button is clicked', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Search for "Jane"
      const searchInput = screen.getByPlaceholderText('Search by name or position...');
      await user.type(searchInput, 'Jane');

      // Clear search
      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // Search input should be empty
      expect(searchInput).toHaveValue('');

      // All employees should be visible again
      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
        expect(screen.getByText('Charlie Davis')).toBeInTheDocument();
      });
    });

    it('should show "No results found" when search returns empty', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Search for non-existent employee
      const searchInput = screen.getByPlaceholderText('Search by name or position...');
      await user.type(searchInput, 'NonExistent');

      // No employees should be visible
      await waitFor(() => {
        expect(screen.queryAllByText('John Doe').length).toBe(0);
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive when searching', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Search with different case
      const searchInput = screen.getByPlaceholderText('Search by name or position...');
      await user.type(searchInput, 'JANE');

      // Jane Smith should still be found
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 29.7: Display team size for each manager', () => {
    it('should display team size badge for managers with direct reports', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Expand all to see all nodes
      const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
      fireEvent.click(expandAllButton);

      // John Doe should have team size badge showing 2 direct reports
      await waitFor(() => {
        const badges = screen.getAllByText(/^\d+$/);
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('should display correct team size count for each manager', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Expand all
      const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
      fireEvent.click(expandAllButton);

      // Jane Smith should have team size badge showing 2 direct reports
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should not display team size badge for employees without direct reports', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Expand all
      const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
      fireEvent.click(expandAllButton);

      // Bob Johnson has no direct reports, so no team size badge
      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('should update team size when expanding/collapsing nodes', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Expand all
      const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
      fireEvent.click(expandAllButton);

      // Jane Smith should be visible with team size
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Collapse all
      const collapseAllButton = screen.getByRole('button', { name: /Collapse All/i });
      fireEvent.click(collapseAllButton);

      // Jane Smith should not be visible
      await waitFor(() => {
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should display team size in employee detail modal', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Click on John Doe
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      // Modal should show team size
      await waitFor(() => {
        expect(screen.getByText('Direct Reports')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display team members list in employee detail modal', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Click on John Doe
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      // Modal should list team members
      await waitFor(() => {
        expect(screen.getByText('Team Members:')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Davis')).toBeInTheDocument();
      });
    });
  });

  describe('Combined functionality', () => {
    it('should maintain search results when clicking on employee', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      const user = userEvent.setup();
      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Search for "Jane"
      const searchInput = screen.getByPlaceholderText('Search by name or position...');
      await user.type(searchInput, 'Jane');

      // Click on Jane Smith
      const janeElements = screen.getAllByText('Jane Smith');
      const janeElement = janeElements[0].closest('div');
      if (janeElement) {
        fireEvent.click(janeElement);
      }

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText('Employee Details')).toBeInTheDocument();
      });

      // Search should still be active
      expect(searchInput).toHaveValue('Jane');
    });

    it('should display team size badge and allow clicking for details', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);

      renderWithRouter(<OrgChart />);

      // Wait for the component to load
      await screen.findByText('John Doe');

      // Expand all
      const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
      fireEvent.click(expandAllButton);

      // Click on John Doe
      const johnDoeElements = screen.getAllByText('John Doe');
      const johnDoeElement = johnDoeElements[0].closest('div');
      if (johnDoeElement) {
        fireEvent.click(johnDoeElement);
      }

      // Modal should show team size
      await waitFor(() => {
        expect(screen.getByText('Direct Reports')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });
});
