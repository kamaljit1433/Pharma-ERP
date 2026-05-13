import { UserRole } from '@/types/auth';
import { Permission, hasPermission } from './permissions';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  requiredPermission?: Permission;
  children?: NavigationItem[];
}

// Define all navigation items
const allNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/employees',
    icon: 'Users',
    requiredPermission: Permission.VIEW_EMPLOYEES,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/attendance',
    icon: 'Calendar',
    requiredPermission: Permission.VIEW_ATTENDANCE,
  },
  {
    id: 'leave',
    label: 'Leave',
    path: '/leave',
    icon: 'CalendarDays',
    requiredPermission: Permission.VIEW_LEAVE,
  },
  {
    id: 'payroll',
    label: 'Payroll',
    path: '/payroll',
    icon: 'DollarSign',
    requiredPermission: Permission.VIEW_PAYROLL,
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    path: '/recruitment',
    icon: 'UserPlus',
    requiredPermission: Permission.VIEW_RECRUITMENT,
  },
  {
    id: 'performance',
    label: 'Performance',
    path: '/performance',
    icon: 'TrendingUp',
    requiredPermission: Permission.VIEW_PERFORMANCE,
  },
  {
    id: 'training',
    label: 'Training',
    path: '/training',
    icon: 'GraduationCap',
    requiredPermission: Permission.VIEW_TRAINING,
  },
  {
    id: 'benefits',
    label: 'Benefits',
    path: '/benefits',
    icon: 'Gift',
    requiredPermission: Permission.VIEW_BENEFITS,
  },
  {
    id: 'separation',
    label: 'Separation',
    path: '/separation',
    icon: 'UserMinus',
    requiredPermission: Permission.VIEW_SEPARATION,
  },
  {
    id: 'assets',
    label: 'Assets',
    path: '/assets',
    icon: 'Package',
    requiredPermission: Permission.VIEW_ASSETS,
  },
  {
    id: 'hierarchy',
    label: 'Organization',
    path: '/hierarchy',
    icon: 'Network',
    requiredPermission: Permission.VIEW_ORGANIZATION,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    requiredPermission: Permission.VIEW_SETTINGS,
  },
];

/**
 * Filter navigation items based on user role
 */
export const getNavigationForRole = (role: UserRole): NavigationItem[] => {
  return allNavigationItems.filter((item) => {
    // If no permission required, show to all
    if (!item.requiredPermission) {
      return true;
    }
    
    // Check if user has required permission
    return hasPermission(role, item.requiredPermission!);
  });
};

/**
 * Get quick actions based on user role
 */
export const getQuickActionsForRole = (role: UserRole): NavigationItem[] => {
  const quickActions: Record<UserRole, NavigationItem[]> = {
    [UserRole.SUPER_ADMIN]: [
      { id: 'create-employee', label: 'Add Employee', path: '/employees/new', icon: 'UserPlus' },
      { id: 'process-payroll', label: 'Process Payroll', path: '/payroll/process', icon: 'DollarSign' },
      { id: 'view-reports', label: 'View Reports', path: '/reports', icon: 'FileText' },
    ],
    [UserRole.HR_MANAGER]: [
      { id: 'create-employee', label: 'Add Employee', path: '/employees/new', icon: 'UserPlus' },
      { id: 'approve-leaves', label: 'Approve Leaves', path: '/leave/approvals', icon: 'CheckCircle' },
      { id: 'post-job', label: 'Post Job', path: '/recruitment/jobs/new', icon: 'Briefcase' },
    ],
    [UserRole.DEPARTMENT_MANAGER]: [
      { id: 'view-team', label: 'View Team', path: '/employees?filter=my-team', icon: 'Users' },
      { id: 'approve-leaves', label: 'Approve Leaves', path: '/leave/approvals', icon: 'CheckCircle' },
      { id: 'team-attendance', label: 'Team Attendance', path: '/attendance/team', icon: 'Calendar' },
    ],
    [UserRole.FINANCE]: [
      { id: 'process-payroll', label: 'Process Payroll', path: '/payroll/process', icon: 'DollarSign' },
      { id: 'payroll-reports', label: 'Payroll Reports', path: '/payroll/reports', icon: 'FileText' },
    ],
    [UserRole.EMPLOYEE]: [
      { id: 'mark-attendance', label: 'Mark Attendance', path: '/attendance', icon: 'Clock' },
      { id: 'request-leave', label: 'Request Leave', path: '/leave', icon: 'CalendarDays' },
      { id: 'view-payslip', label: 'View Payslip', path: '/payroll/payslips', icon: 'FileText' },
    ],
    [UserRole.IT_ADMIN]: [
      { id: 'manage-users', label: 'Manage Users', path: '/settings/users', icon: 'Users' },
      { id: 'system-settings', label: 'System Settings', path: '/settings/system', icon: 'Settings' },
    ],
  };

  return quickActions[role] || [];
};
