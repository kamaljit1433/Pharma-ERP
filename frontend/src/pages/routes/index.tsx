import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../../App';
import Dashboard from '../Dashboard';

// Placeholder components - will be implemented in later tasks
const Login = () => (
  <div style={{ padding: '20px', fontSize: '18px', color: '#000' }}>
    Login Page
  </div>
);

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
        element: <Dashboard />,
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
