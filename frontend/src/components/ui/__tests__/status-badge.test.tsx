import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  StatusBadge,
  LeaveStatusBadge,
  AttendanceStatusBadge,
  EmployeeStatusBadge,
} from '../status-badge';

describe('StatusBadge', () => {
  describe('StatusBadge Component', () => {
    it('should render pending status with icon and text', () => {
      render(<StatusBadge status="pending" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Pending')).toBeInTheDocument();
    });

    it('should render approved status with icon and text', () => {
      render(<StatusBadge status="approved" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Approved')).toBeInTheDocument();
    });

    it('should render rejected status with icon and text', () => {
      render(<StatusBadge status="rejected" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Rejected')).toBeInTheDocument();
    });

    it('should render cancelled status with icon and text', () => {
      render(<StatusBadge status="cancelled" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Cancelled')).toBeInTheDocument();
    });

    it('should render success status with icon and text', () => {
      render(<StatusBadge status="success" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByLabelText('Success')).toBeInTheDocument();
    });

    it('should render warning status with icon and text', () => {
      render(<StatusBadge status="warning" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByLabelText('Warning')).toBeInTheDocument();
    });

    it('should render error status with icon and text', () => {
      render(<StatusBadge status="error" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByLabelText('Error')).toBeInTheDocument();
    });

    it('should render info status with icon and text', () => {
      render(<StatusBadge status="info" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByLabelText('Information')).toBeInTheDocument();
    });

    it('should render without icon when showIcon is false', () => {
      const { container } = render(<StatusBadge status="approved" showIcon={false} />);
      
      expect(screen.getByText('Approved')).toBeInTheDocument();
      // Icon should not be present
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StatusBadge status="approved" className="custom-class" />
      );
      
      const badge = container.querySelector('.custom-class');
      expect(badge).toBeInTheDocument();
    });

    it('should render different sizes', () => {
      const { rerender, container } = render(<StatusBadge status="approved" size="sm" />);
      expect(container.querySelector('.text-xs')).toBeInTheDocument();

      rerender(<StatusBadge status="approved" size="md" />);
      expect(container.querySelector('.text-sm')).toBeInTheDocument();

      rerender(<StatusBadge status="approved" size="lg" />);
      expect(container.querySelector('.text-base')).toBeInTheDocument();
    });

    it('should handle unknown status gracefully', () => {
      // @ts-expect-error Testing invalid status
      const { container } = render(<StatusBadge status="unknown" />);
      
      // Should not render anything
      expect(container.firstChild).toBeNull();
    });
  });

  describe('LeaveStatusBadge Component', () => {
    it('should render pending leave status', () => {
      render(<LeaveStatusBadge status="pending" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Pending')).toBeInTheDocument();
    });

    it('should render approved leave status', () => {
      render(<LeaveStatusBadge status="approved" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Approved')).toBeInTheDocument();
    });

    it('should render rejected leave status', () => {
      render(<LeaveStatusBadge status="rejected" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Rejected')).toBeInTheDocument();
    });

    it('should render cancelled leave status', () => {
      render(<LeaveStatusBadge status="cancelled" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Cancelled')).toBeInTheDocument();
    });
  });

  describe('AttendanceStatusBadge Component', () => {
    it('should render present attendance status', () => {
      render(<AttendanceStatusBadge status="present" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Present')).toBeInTheDocument();
      expect(screen.getByLabelText('Attendance: Present')).toBeInTheDocument();
    });

    it('should render absent attendance status', () => {
      render(<AttendanceStatusBadge status="absent" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Absent')).toBeInTheDocument();
      expect(screen.getByLabelText('Attendance: Absent')).toBeInTheDocument();
    });

    it('should render half day attendance status', () => {
      render(<AttendanceStatusBadge status="half_day" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Half Day')).toBeInTheDocument();
      expect(screen.getByLabelText('Attendance: Half Day')).toBeInTheDocument();
    });

    it('should render on leave attendance status', () => {
      render(<AttendanceStatusBadge status="on_leave" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('On Leave')).toBeInTheDocument();
      expect(screen.getByLabelText('Attendance: On Leave')).toBeInTheDocument();
    });
  });

  describe('EmployeeStatusBadge Component', () => {
    it('should render active employee status', () => {
      render(<EmployeeStatusBadge status="active" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee Status: Active')).toBeInTheDocument();
    });

    it('should render on leave employee status', () => {
      render(<EmployeeStatusBadge status="on_leave" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('On Leave')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee Status: On Leave')).toBeInTheDocument();
    });

    it('should render suspended employee status', () => {
      render(<EmployeeStatusBadge status="suspended" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Suspended')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee Status: Suspended')).toBeInTheDocument();
    });

    it('should render resigned employee status', () => {
      render(<EmployeeStatusBadge status="resigned" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Resigned')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee Status: Resigned')).toBeInTheDocument();
    });

    it('should render terminated employee status', () => {
      render(<EmployeeStatusBadge status="terminated" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Terminated')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee Status: Terminated')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(<StatusBadge status="approved" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });

    it('should have descriptive ARIA label', () => {
      render(<StatusBadge status="approved" />);
      
      const badge = screen.getByLabelText('Status: Approved');
      expect(badge).toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      const { container } = render(<StatusBadge status="approved" />);
      
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should include visible text for screen readers', () => {
      render(<StatusBadge status="approved" />);
      
      const text = screen.getByText('Approved');
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe('SPAN');
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should use theme colors with proper contrast', () => {
      const { container } = render(<StatusBadge status="approved" />);
      
      const badge = container.querySelector('[role="status"]');
      expect(badge).toHaveClass('bg-approved');
      expect(badge).toHaveClass('text-approved-foreground');
    });

    it('should apply hover states', () => {
      const { container } = render(<StatusBadge status="approved" />);
      
      const badge = container.querySelector('[role="status"]');
      expect(badge).toHaveClass('hover:bg-approved/90');
    });
  });

  describe('Non-Color Information Conveyance', () => {
    it('should include icon for visual identification', () => {
      const { container } = render(<StatusBadge status="approved" />);
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should include text label', () => {
      render(<StatusBadge status="approved" />);
      
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('should use color as additional cue', () => {
      const { container } = render(<StatusBadge status="approved" />);
      
      const badge = container.querySelector('[role="status"]');
      expect(badge).toHaveClass('bg-approved');
    });

    it('should provide all three cues: icon + text + color', () => {
      const { container } = render(<StatusBadge status="approved" />);
      
      // Icon
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      
      // Text
      expect(screen.getByText('Approved')).toBeInTheDocument();
      
      // Color
      const badge = container.querySelector('[role="status"]');
      expect(badge).toHaveClass('bg-approved');
    });
  });
});
