import apiClient from './api';
import { User } from '@/types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
}

export interface LoginResponse {
  success?: boolean;
  user: User;
  requiresMfa?: boolean;
  message?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshSessionResponse {
  success?: boolean;
  user: User;
}

// Token storage utilities — sessionStorage keeps each tab's session independent
const TOKEN_STORAGE_KEY = 'auth_tokens';

export const tokenStorage = {
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  },

  getAccessToken: (): string | null => {
    const tokens = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokens) return null;
    try {
      return JSON.parse(tokens).accessToken;
    } catch {
      return null;
    }
  },

  getRefreshToken: (): string | null => {
    const tokens = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokens) return null;
    try {
      return JSON.parse(tokens).refreshToken;
    } catch {
      return null;
    }
  },

  clearTokens: () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens if returned
    if (response.data.tokens) {
      tokenStorage.setTokens(response.data.tokens);
      // Update API client with new token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.accessToken}`;
    }
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Always clear tokens, even if logout API call fails
      tokenStorage.clearTokens();
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/auth/profile');
    return response.data.user;
  },

  refreshSession: async (): Promise<RefreshSessionResponse> => {
    const response = await apiClient.post<RefreshSessionResponse>('/auth/refresh');
    return response.data;
  },
  
  // Initialize tokens from storage on app startup
  initializeTokens: () => {
    // Remove any leftover tokens from the old localStorage-based storage
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth-storage');

    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  },
};
