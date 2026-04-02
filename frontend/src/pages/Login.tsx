import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/forms/LoginForm';
import { Card } from '@/components/ui/card';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [showMFA, setShowMFA] = useState(false);

  // Get the intended destination from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If already authenticated, redirect to intended destination
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = (requiresMfa: boolean) => {
    if (requiresMfa) {
      setShowMFA(true);
    } else {
      // Redirect to intended destination after successful login
      navigate(from, { replace: true });
    }
  };

  const handleMFASuccess = () => {
    // Redirect to intended destination after successful MFA verification
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Employee Management System
          </h1>
          <p className="text-gray-600">
            {showMFA ? 'Enter your verification code' : 'Sign in to your account'}
          </p>
        </div>

        <Card className="p-6">
          <LoginForm
            onSuccess={handleLoginSuccess}
            onMFASuccess={handleMFASuccess}
            showMFA={showMFA}
          />
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Need help? Contact your system administrator
        </p>
      </div>
    </div>
  );
};

export default Login;
