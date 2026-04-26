import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDetailModal from '../EmployeeDetailModal';
import { HierarchyNode } from '../../../services/hierarchyService';

const mockNode: HierarchyNode = {
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
      children: [],
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Charlie Davis',
      designationId: 'des3',
      designationName: 'CFO',
      departmentId: 'dept3',
      departmentName: 'Finance',
      managerId: 'emp1',
      managerName: 'John Doe',
      profilePhotoUrl: 'https://example.com/photo3.jpg',
      isActive: true,
      children: [],
    },
  ],
};

const mockNodeWithoutChildren: HierarchyNode = {
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
  children: [],
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EmployeeDetailModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Display', () => {
    it('should not render when isOpen is false', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={false} onClose={vi.fn()} />
      );

      expect(screen.queryByText('Employee Details')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Employee Details')).toBeInTheDocument();
    });

    it('should not render when node is null', () => {
      renderWithRouter(
        <EmployeeDetailModal node={null} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.queryByText('Employee Details')).not.toBeInTheDocument();
    });
  });

  describe('Employee Information Display', () => {
    it('should display employee name and designation', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CEO')).toBeInTheDocument();
    });

    it('should display employee department', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Executive')).toBeInTheDocument();
    });

    it('should display employee status as Active', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display employee status as Inactive when isActive is false', () => {
      const inactiveNode = { ...mockNode, isActive: false };
      renderWithRouter(
        <EmployeeDetailModal node={inactiveNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should display reporting manager name', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNodeWithoutChildren} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Reporting Manager')).toBeInTheDocument();
    });

    it('should display employee avatar with initials', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Team Information Display', () => {
    it('should display team section when employee has direct reports', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Direct Reports')).toBeInTheDocument();
    });

    it('should display correct direct report count', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display team members list', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Team Members:')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Charlie Davis')).toBeInTheDocument();
    });

    it('should display team member designations', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('CTO')).toBeInTheDocument();
      expect(screen.getByText('CFO')).toBeInTheDocument();
    });

    it('should not display team section when employee has no direct reports', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNodeWithoutChildren} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.queryByText('Team Members:')).not.toBeInTheDocument();
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={onClose} />
      );

      const closeButton = screen.getByRole('button', { name: /Close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should have a "View Full Profile" button', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: /View Full Profile/i })).toBeInTheDocument();
    });

    it('should navigate to employee profile when "View Full Profile" is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={onClose} />
      );

      const viewProfileButton = screen.getByRole('button', { name: /View Full Profile/i });
      await user.click(viewProfileButton);

      // onClose should be called after navigation
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Employee Details')).toBeInTheDocument();
    });

    it('should have descriptive text for the modal', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('View employee information and team structure')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      renderWithRouter(
        <EmployeeDetailModal node={mockNode} isOpen={true} onClose={vi.fn()} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle employee with no profile photo', () => {
      const nodeWithoutPhoto = { ...mockNode, profilePhotoUrl: undefined };
      renderWithRouter(
        <EmployeeDetailModal node={nodeWithoutPhoto} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle employee with no reporting manager', () => {
      const nodeWithoutManager = { ...mockNode, managerName: undefined, managerId: undefined };
      renderWithRouter(
        <EmployeeDetailModal node={nodeWithoutManager} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.queryByText('Reporting Manager')).not.toBeInTheDocument();
    });

    it('should handle long employee names', () => {
      const nodeWithLongName = {
        ...mockNode,
        employeeName: 'Alexander Christopher Montgomery III',
      };
      renderWithRouter(
        <EmployeeDetailModal node={nodeWithLongName} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('Alexander Christopher Montgomery III')).toBeInTheDocument();
    });

    it('should handle many direct reports', () => {
      const manyChildren = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        employeeId: `emp${i}`,
        employeeName: `Employee ${i}`,
        designationId: `des${i}`,
        designationName: `Position ${i}`,
        departmentId: `dept${i}`,
        departmentName: `Department ${i}`,
        managerId: 'emp1',
        managerName: 'John Doe',
        profilePhotoUrl: `https://example.com/photo${i}.jpg`,
        isActive: true,
        children: [],
      }));

      const nodeWithManyChildren = { ...mockNode, children: manyChildren };
      renderWithRouter(
        <EmployeeDetailModal node={nodeWithManyChildren} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Employee 0')).toBeInTheDocument();
    });
  });
});
