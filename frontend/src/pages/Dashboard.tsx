import React from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/auth';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import HRManagerDashboard from '../components/dashboard/HRManagerDashboard';
import DepartmentManagerDashboard from '../components/dashboard/DepartmentManagerDashboard';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  // Render role-specific dashboard
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.IT_ADMIN:
      return <AdminDashboard />;
    
    case UserRole.HR_MANAGER:
      return <HRManagerDashboard />;
    
    case UserRole.DEPARTMENT_MANAGER:
      return <DepartmentManagerDashboard />;
    
    case UserRole.FINANCE:
      // Finance users see HR Manager dashboard with focus on payroll
      return <HRManagerDashboard />;
    
    case UserRole.EMPLOYEE:
      return <EmployeeDashboard />;
    
    default:
      return <EmployeeDashboard />;
  }
};

export default Dashboard;
