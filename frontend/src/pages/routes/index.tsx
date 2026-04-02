import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../../App';
import Dashboard from '../Dashboard';
import Login from '../Login';
import Employees from '../Employees';
import EmployeeDetail from '../EmployeeDetail';
import { Attendance } from '../Attendance';
import Leave from '../Leave';
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
        path: 'employees/:id',
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
