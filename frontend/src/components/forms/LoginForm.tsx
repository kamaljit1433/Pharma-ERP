import React, { useState } from 'react';
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
        // Verify MFA token
        const response = await authService.verifyMFA(mfaToken);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Login successful',
            variant: 'default',
          });
          onMFASuccess();
        }
      } else {
        // Regular login
        const response = await authService.login({ email, password });
        
        if (response.data.requiresMfa) {
          toast({
            title: 'MFA Required',
            description: 'Please enter your verification code',
            variant: 'default',
          });
          onSuccess(true);
        } else {
          // Update auth store with user data
          await login(email, password);
          toast({
            title: 'Success',
            description: 'Login successful',
            variant: 'default',
          });
          onSuccess(false);
        }
      }
    } catch (error: any) {
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
  };

  // Clear error when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: undefined });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const handleMfaTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMfaToken(e.target.value);
    if (errors.mfaToken) {
      setErrors({ ...errors, mfaToken: undefined });
    }
  };

  if (showMFA) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
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
          />
          {errors.mfaToken && (
            <p className="text-sm text-red-500">{errors.mfaToken}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          className={errors.password ? 'border-red-500' : ''}
          disabled={isLoading}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
