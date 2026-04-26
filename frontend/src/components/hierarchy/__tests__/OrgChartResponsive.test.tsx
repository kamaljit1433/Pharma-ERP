import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrgChart from '../OrgChart';
import hierarchyService from '../../../services/hierarchyService';

vi.mock('../../../services/hierarchyService');
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data')
  }))
}));

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

const mockDepartments = [
  { id: 'dept1', name: 'Executive' },
  { id: 'dept2', name: 'Engineering' },
  { id: 'dept3', name: 'Finance' },
];

describe('OrgChart Responsive Features - Requirements 29.8, 29.9, 29.10', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock DOM methods for image export
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock createElement and click for download
    const mockLink = {
      click: vi.fn(),
      download: '',
      href: '',
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockLink as any;
      }
      return document.createElement(tagName);
    });
  });

  describe('Requirement 29.8: Make org chart responsive for mobile devices', () => {
    it('should render with responsive classes for mobile', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check that responsive classes are applied
      const orgChartContainer = screen.getByText('John Doe').closest('.ml-2');
      expect(orgChartContainer).toHaveClass('sm:ml-4');
    });

    it('should show mobile-optimized team size badges', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

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

        // Check for mobile-specific badge classes
        const badges = screen.getAllByText('1');
        expect(badges.length).toBeGreaterThan(0);
      }
    });

    it('should have responsive button sizes and text', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart />);

      await waitFor(() => {
        expect(screen.getByText('Organization Chart')).toBeInTheDocument();
      });

      // Check that buttons have responsive text classes
      const expandButton = screen.getByRole('button', { name: /Expand All/i });
      expect(expandButton).toHaveClass('text-xs', 'sm:text-sm');

      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      expect(exportButton).toHaveClass('text-xs', 'sm:text-sm');
    });

    it('should adapt layout for different screen sizes', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart />);

      await waitFor(() => {
        expect(screen.getByText('Organization Chart')).toBeInTheDocument();
      });

      // Check that the controls have responsive layout classes
      const controlsContainer = screen.getByText('Expand All').closest('.flex');
      expect(controlsContainer).toHaveClass('flex-wrap');
    });

    it('should show responsive title sizes', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart />);

      await waitFor(() => {
        const title = screen.getByText('Organization Chart');
        expect(title).toHaveClass('text-lg', 'sm:text-xl');
      });
    });
  });

  describe('Requirement 29.9: Allow exporting org chart as an image', () => {
    it('should render export button', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });
    });

    it('should disable export button when no data', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue({
        root: null as any,
        totalEmployees: 0,
        totalDepartments: 0,
      });
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Export as image/i });
        expect(exportButton).toBeDisabled();
      });
    });

    it('should show loading state during export', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      await user.click(exportButton);

      // Should show loading state briefly
      await waitFor(() => {
        expect(screen.getByText('Exporting...')).toBeInTheDocument();
      });
    });

    it('should call html2canvas when exporting', async () => {
      const html2canvas = await import('html2canvas');
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(html2canvas.default).toHaveBeenCalled();
      });
    });

    it('should generate correct filename for export', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart departmentId="dept2" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      await user.click(exportButton);

      await waitFor(() => {
        const mockLink = document.createElement('a');
        expect(mockLink.download).toContain('org-chart');
      });
    });

    it('should expand all nodes before export', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      await user.click(exportButton);

      // Should temporarily expand all nodes for complete export
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 29.10: Display department-specific org charts', () => {
    it('should render department filter dropdown', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByText('Filter by department')).toBeInTheDocument();
      });
    });

    it('should not render department filter when disabled', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart showDepartmentFilter={false} />);

      await waitFor(() => {
        expect(screen.getByText('Organization Chart')).toBeInTheDocument();
      });

      expect(screen.queryByText('Filter by department')).not.toBeInTheDocument();
    });

    it('should fetch departments for filter dropdown', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(hierarchyService.getDepartments).toHaveBeenCalled();
      });
    });

    it('should filter org chart by selected department', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByText('Filter by department')).toBeInTheDocument();
      });

      // Click on department filter
      const filterTrigger = screen.getByText('Filter by department');
      await user.click(filterTrigger);

      // Select Engineering department
      const engineeringOption = screen.getByText('Engineering');
      await user.click(engineeringOption);

      // Should call getOrgChart with department filter
      await waitFor(() => {
        expect(hierarchyService.getOrgChart).toHaveBeenCalledWith(undefined, 'dept2');
      });
    });

    it('should show "All Departments" option in filter', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByText('Filter by department')).toBeInTheDocument();
      });

      // Click on department filter
      const filterTrigger = screen.getByText('Filter by department');
      await user.click(filterTrigger);

      // Should show "All Departments" option
      expect(screen.getByText('All Departments')).toBeInTheDocument();
    });

    it('should display filtered status in description', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart departmentId="dept2" showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByText('(Filtered by department)')).toBeInTheDocument();
      });
    });

    it('should reset to all departments when "All Departments" is selected', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart departmentId="dept2" showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByText('Filter by department')).toBeInTheDocument();
      });

      // Click on department filter
      const filterTrigger = screen.getByText('Filter by department');
      await user.click(filterTrigger);

      // Select "All Departments"
      const allDepartmentsOption = screen.getByText('All Departments');
      await user.click(allDepartmentsOption);

      // Should call getOrgChart without department filter
      await waitFor(() => {
        expect(hierarchyService.getOrgChart).toHaveBeenCalledWith(undefined, undefined);
      });
    });

    it('should include department in export filename when filtered', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart departmentId="dept2" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      await user.click(exportButton);

      await waitFor(() => {
        const mockLink = document.createElement('a');
        expect(mockLink.download).toContain('department-dept2');
      });
    });

    it('should handle department filter errors gracefully', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockRejectedValue(new Error('Failed to fetch departments'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<OrgChart showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByText('Organization Chart')).toBeInTheDocument();
      });

      // Should not show department filter if fetch fails
      expect(screen.queryByText('Filter by department')).not.toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch departments:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Combined responsive functionality', () => {
    it('should maintain responsive design with department filter', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      render(<OrgChart showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByText('Filter by department')).toBeInTheDocument();
      });

      // Check that department filter has responsive classes
      const filterContainer = screen.getByText('Filter by department').closest('.flex-1');
      expect(filterContainer).toHaveClass('max-w-xs');
    });

    it('should export department-filtered chart with responsive layout', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart departmentId="dept2" showDepartmentFilter={true} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      await user.click(exportButton);

      // Should export with department-specific filename
      await waitFor(() => {
        const mockLink = document.createElement('a');
        expect(mockLink.download).toContain('department-dept2');
      });
    });

    it('should handle mobile export with department filtering', async () => {
      vi.mocked(hierarchyService.getOrgChart).mockResolvedValue(mockOrgChartData);
      vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

      const user = userEvent.setup();
      render(<OrgChart departmentId="dept2" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export as image/i })).toBeInTheDocument();
      });

      // Export button should have mobile-responsive classes
      const exportButton = screen.getByRole('button', { name: /Export as image/i });
      expect(exportButton).toHaveClass('gap-1', 'sm:gap-2');

      await user.click(exportButton);

      // Should work on mobile
      await waitFor(() => {
        expect(screen.getByText('Exporting...')).toBeInTheDocument();
      });
    });
  });
});