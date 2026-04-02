import apiClient from './api';
import { UserRole } from '@/types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
}

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    requiresMfa?: boolean;
  };
  message?: string;
}

export interface RefreshSessionResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  verifyMFA: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/verify-mfa', { token });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  refreshSession: async (): Promise<RefreshSessionResponse> => {
    const response = await apiClient.post<RefreshSessionResponse>('/auth/refresh');
    return response.data;
  },
};
