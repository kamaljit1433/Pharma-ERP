import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../../App';
import Dashboard from '../Dashboard';
import Login from '../Login';
import Employees from '../Employees';
import EmployeeDetail from '../EmployeeDetail';
import { Attendance } from '../Attendance';
import Leave from '../Leave';
import Payroll from '../Payroll';
import Recruitment from '../Recruitment';
import EmployeeCreate from '../EmployeeCreate';
import Performance from '../Performance';
import Training from '../Training';
import Benefits from '../Benefits';
import Separation from '../Separation';
import Organization from '../Organization';
import Settings from '../Settings';
import Profile from '../Profile';
import JobPostingCreate from '../JobPostingCreate';
import ProtectedRoute from '../../routes/ProtectedRoute';
import { UserRole } from '../../types/auth';

const NotFound = () => (
  <div style={{ padding: '20px', fontSize: '18px', color: '#000' }}>
    404 - Page Not Found
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees',
        element: (
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees/new',
        element: (
          <ProtectedRoute>
            <EmployeeCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees/:id',
        element: (
          <ProtectedRoute>
            <EmployeeDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees/:id/edit',
        element: (
          <ProtectedRoute>
            <EmployeeDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance',
        element: (
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        ),
      },
      {
        path: 'leave',
        element: (
          <ProtectedRoute>
            <Leave />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payroll',
        element: (
          <ProtectedRoute requiredRoles={[UserRole.FINANCE, UserRole.HR_MANAGER]}>
            <Payroll />
          </ProtectedRoute>
        ),
      },
      {
        path: 'recruitment',
        element: (
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]}>
            <Recruitment />
          </ProtectedRoute>
        ),
      },
      {
        path: 'recruitment/jobs/new',
        element: (
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]}>
            <JobPostingCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'performance',
        element: (
          <ProtectedRoute>
            <Performance />
          </ProtectedRoute>
        ),
      },
      {
        path: 'training',
        element: (
          <ProtectedRoute>
            <Training />
          </ProtectedRoute>
        ),
      },
      {
        path: 'benefits',
        element: (
          <ProtectedRoute>
            <Benefits />
          </ProtectedRoute>
        ),
      },
      {
        path: 'separation',
        element: (
          <ProtectedRoute>
            <Separation />
          </ProtectedRoute>
        ),
      },
      {
        path: 'hierarchy',
        element: (
          <ProtectedRoute>
            <Organization />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
