import React from 'react';
import { Badge } from './badge';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info as InfoIcon,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StatusBadge Component
 * 
 * Accessible status indicator that complies with WCAG 2.1 AA standards:
 * - Uses color + icon + text (Requirement 21.9: not relying solely on color)
 * - Maintains 4.5:1 contrast ratio for text (Requirement 21.7)
 * - Includes ARIA labels for screen readers
 * - Uses semantic HTML
 * 
 * Requirements: 21.6, 21.7, 21.8, 21.9
 */

export type StatusType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'active'
  | 'inactive'
  | 'completed'
  | 'in_progress'
  | 'on_hold';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  StatusType,
  {
    className: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    ariaLabel: string;
  }
> = {
  pending: {
    className: 'bg-pending text-pending-foreground hover:bg-pending/90',
    icon: Clock,
    label: 'Pending',
    ariaLabel: 'Status: Pending',
  },
  approved: {
    className: 'bg-approved text-approved-foreground hover:bg-approved/90',
    icon: CheckCircle2,
    label: 'Approved',
    ariaLabel: 'Status: Approved',
  },
  rejected: {
    className: 'bg-rejected text-rejected-foreground hover:bg-rejected/90',
    icon: XCircle,
    label: 'Rejected',
    ariaLabel: 'Status: Rejected',
  },
  cancelled: {
    className: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    icon: AlertCircle,
    label: 'Cancelled',
    ariaLabel: 'Status: Cancelled',
  },
  success: {
    className: 'bg-success text-success-foreground hover:bg-success/90',
    icon: CheckCircle,
    label: 'Success',
    ariaLabel: 'Success',
  },
  warning: {
    className: 'bg-warning text-warning-foreground hover:bg-warning/90',
    icon: AlertTriangle,
    label: 'Warning',
    ariaLabel: 'Warning',
  },
  error: {
    className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    icon: XCircle,
    label: 'Error',
    ariaLabel: 'Error',
  },
  info: {
    className: 'bg-info text-info-foreground hover:bg-info/90',
    icon: InfoIcon,
    label: 'Info',
    ariaLabel: 'Information',
  },
  active: {
    className: 'bg-success text-success-foreground hover:bg-success/90',
    icon: CheckCircle,
    label: 'Active',
    ariaLabel: 'Status: Active',
  },
  inactive: {
    className: 'bg-muted text-muted-foreground hover:bg-muted/90',
    icon: AlertCircle,
    label: 'Inactive',
    ariaLabel: 'Status: Inactive',
  },
  completed: {
    className: 'bg-success text-success-foreground hover:bg-success/90',
    icon: CheckCircle2,
    label: 'Completed',
    ariaLabel: 'Status: Completed',
  },
  in_progress: {
    className: 'bg-info text-info-foreground hover:bg-info/90',
    icon: Clock,
    label: 'In Progress',
    ariaLabel: 'Status: In Progress',
  },
  on_hold: {
    className: 'bg-warning text-warning-foreground hover:bg-warning/90',
    icon: AlertTriangle,
    label: 'On Hold',
    ariaLabel: 'Status: On Hold',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  size = 'md',
}) => {
  const config = statusConfig[status];

  if (!config) {
    console.warn(`Unknown status type: ${status}`);
    return null;
  }

  const { className: statusClassName, icon: Icon, label, ariaLabel } = config;

  return (
    <Badge
      className={cn(statusClassName, sizeClasses[size], className)}
      role="status"
      aria-label={ariaLabel}
    >
      {showIcon && (
        <Icon
          className={cn(iconSizeClasses[size], 'mr-1')}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </Badge>
  );
};

/**
 * LeaveStatusBadge Component
 * 
 * Specialized status badge for leave requests
 */
interface LeaveStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LeaveStatusBadge: React.FC<LeaveStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  return <StatusBadge status={status} className={className} size={size} />;
};

/**
 * AttendanceStatusBadge Component
 * 
 * Specialized status badge for attendance records
 */
interface AttendanceStatusBadgeProps {
  status: 'present' | 'absent' | 'half_day' | 'on_leave';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const attendanceConfig: Record<
    string,
    {
      className: string;
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      ariaLabel: string;
    }
  > = {
    present: {
      className: 'bg-success text-success-foreground hover:bg-success/90',
      icon: CheckCircle2,
      label: 'Present',
      ariaLabel: 'Attendance: Present',
    },
    absent: {
      className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      icon: XCircle,
      label: 'Absent',
      ariaLabel: 'Attendance: Absent',
    },
    half_day: {
      className: 'bg-warning text-warning-foreground hover:bg-warning/90',
      icon: AlertTriangle,
      label: 'Half Day',
      ariaLabel: 'Attendance: Half Day',
    },
    on_leave: {
      className: 'bg-info text-info-foreground hover:bg-info/90',
      icon: InfoIcon,
      label: 'On Leave',
      ariaLabel: 'Attendance: On Leave',
    },
  };

  const config = attendanceConfig[status];

  if (!config) {
    return null;
  }

  const { className: statusClassName, icon: Icon, label, ariaLabel } = config;

  return (
    <Badge
      className={cn(statusClassName, sizeClasses[size], className)}
      role="status"
      aria-label={ariaLabel}
    >
      <Icon
        className={cn(iconSizeClasses[size], 'mr-1')}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Badge>
  );
};

/**
 * EmployeeStatusBadge Component
 * 
 * Specialized status badge for employee status
 */
interface EmployeeStatusBadgeProps {
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const employeeConfig: Record<
    string,
    {
      className: string;
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      ariaLabel: string;
    }
  > = {
    active: {
      className: 'bg-success text-success-foreground hover:bg-success/90',
      icon: CheckCircle,
      label: 'Active',
      ariaLabel: 'Employee Status: Active',
    },
    on_leave: {
      className: 'bg-info text-info-foreground hover:bg-info/90',
      icon: InfoIcon,
      label: 'On Leave',
      ariaLabel: 'Employee Status: On Leave',
    },
    suspended: {
      className: 'bg-warning text-warning-foreground hover:bg-warning/90',
      icon: AlertTriangle,
      label: 'Suspended',
      ariaLabel: 'Employee Status: Suspended',
    },
    resigned: {
      className: 'bg-muted text-muted-foreground hover:bg-muted/90',
      icon: AlertCircle,
      label: 'Resigned',
      ariaLabel: 'Employee Status: Resigned',
    },
    terminated: {
      className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      icon: XCircle,
      label: 'Terminated',
      ariaLabel: 'Employee Status: Terminated',
    },
  };

  const config = employeeConfig[status];

  if (!config) {
    return null;
  }

  const { className: statusClassName, icon: Icon, label, ariaLabel } = config;

  return (
    <Badge
      className={cn(statusClassName, sizeClasses[size], className)}
      role="status"
      aria-label={ariaLabel}
    >
      <Icon
        className={cn(iconSizeClasses[size], 'mr-1')}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Badge>
  );
};
