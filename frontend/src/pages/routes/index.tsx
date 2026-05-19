import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../../App';
import Login from '../Login';
import ProtectedRoute from '../../routes/ProtectedRoute';
import { UserRole } from '../../types/auth';

// Eager-load Login (public, always first)
// All protected pages are lazy — loaded only when their route is visited
const Dashboard      = React.lazy(() => import('../Dashboard'));
const Employees      = React.lazy(() => import('../Employees'));
const EmployeeDetail = React.lazy(() => import('../EmployeeDetail'));
const EmployeeCreate = React.lazy(() => import('../EmployeeCreate'));
const Attendance     = React.lazy(() => import('../Attendance').then(m => ({ default: m.Attendance })));
const Leave          = React.lazy(() => import('../Leave'));
const Payroll        = React.lazy(() => import('../Payroll'));
const Recruitment    = React.lazy(() => import('../Recruitment'));
const JobPostingCreate = React.lazy(() => import('../JobPostingCreate'));
const Performance    = React.lazy(() => import('../Performance'));
const Training       = React.lazy(() => import('../Training'));
const Benefits       = React.lazy(() => import('../Benefits'));
const Separation     = React.lazy(() => import('../Separation'));
const Assets         = React.lazy(() => import('../Assets'));
const GeoTracking    = React.lazy(() => import('../GeoTracking'));
const Organization   = React.lazy(() => import('../Organization'));
const Settings       = React.lazy(() => import('../Settings'));
const Profile        = React.lazy(() => import('../Profile'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
);

const NotFound = () => (
  <div style={{ padding: '20px', fontSize: '18px', color: '#000' }}>
    404 - Page Not Found
  </div>
);

const lazy = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
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
            {lazy(<Dashboard />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees',
        element: (
          <ProtectedRoute>
            {lazy(<Employees />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees/new',
        element: (
          <ProtectedRoute>
            {lazy(<EmployeeCreate />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees/:id',
        element: (
          <ProtectedRoute>
            {lazy(<EmployeeDetail />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees/:id/edit',
        element: (
          <ProtectedRoute>
            {lazy(<EmployeeDetail />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance',
        element: (
          <ProtectedRoute>
            {lazy(<Attendance />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'leave',
        element: (
          <ProtectedRoute>
            {lazy(<Leave />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'payroll',
        element: (
          <ProtectedRoute requiredRoles={[UserRole.FINANCE, UserRole.HR_MANAGER]}>
            {lazy(<Payroll />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'recruitment',
        element: (
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]}>
            {lazy(<Recruitment />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'recruitment/jobs/new',
        element: (
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]}>
            {lazy(<JobPostingCreate />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'performance',
        element: (
          <ProtectedRoute>
            {lazy(<Performance />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'training',
        element: (
          <ProtectedRoute>
            {lazy(<Training />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'benefits',
        element: (
          <ProtectedRoute>
            {lazy(<Benefits />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'separation',
        element: (
          <ProtectedRoute>
            {lazy(<Separation />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'assets',
        element: (
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.IT_ADMIN, UserRole.FINANCE, UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_MANAGER]}>
            {lazy(<Assets />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'geo-tracking',
        element: (
          <ProtectedRoute>
            {lazy(<GeoTracking />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'hierarchy',
        element: (
          <ProtectedRoute>
            {lazy(<Organization />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            {lazy(<Settings />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {lazy(<Profile />)}
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
