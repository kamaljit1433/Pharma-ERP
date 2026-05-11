import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';

interface LoginFormProps {
  onSuccess: (requiresMfa: boolean) => void;
  onMFASuccess: () => void;
  showMFA: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onMFASuccess, showMFA }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; mfaToken?: string }>({});
  const { login, isLoading } = useAuthStore();
  const { toast } = useToast();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; mfaToken?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (showMFA && !mfaToken.trim()) {
      newErrors.mfaToken = 'Verification code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (showMFA) {
        // Verify MFA token with stored credentials
        await login(email, password, mfaToken);
        toast({
          title: 'Success',
          description: 'Login successful',
          variant: 'default',
        });
        onMFASuccess();
      } else {
        // Regular login
        await login(email, password);
        toast({
          title: 'Success',
          description: 'Login successful',
          variant: 'default',
        });
        onSuccess(false);
      }
    } catch (error: any) {
      // Check if MFA is required
      if (error.response?.data?.requiresMfa || error.message?.includes('MFA')) {
        toast({
          title: 'MFA Required',
          description: 'Please enter your verification code',
          variant: 'default',
        });
        onSuccess(true);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });

        // Set field-specific errors if available
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      }
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      const { email: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      const { password: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleMfaTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMfaToken(e.target.value);
    if (errors.mfaToken) {
      const { mfaToken: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  if (showMFA) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Multi-factor authentication form">
        <div className="space-y-2">
          <Label htmlFor="mfaToken">Verification Code</Label>
          <Input
            id="mfaToken"
            type="text"
            placeholder="Enter 6-digit code"
            value={mfaToken}
            onChange={handleMfaTokenChange}
            maxLength={6}
            className={errors.mfaToken ? 'border-red-500' : ''}
            disabled={isLoading}
            autoFocus
            aria-required="true"
            aria-invalid={!!errors.mfaToken}
            aria-describedby={errors.mfaToken ? 'mfaToken-error' : undefined}
          />
          {errors.mfaToken && (
            <p id="mfaToken-error" className="text-sm text-red-500" role="alert">
              {errors.mfaToken}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading} loading={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@company.com"
          value={email}
          onChange={handleEmailChange}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
          autoComplete="email"
          autoFocus
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            disabled={isLoading}
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-red-500" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} loading={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
