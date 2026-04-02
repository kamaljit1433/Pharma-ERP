export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HR_MANAGER = 'hr_manager',
  DEPARTMENT_MANAGER = 'department_manager',
  FINANCE = 'finance',
  EMPLOYEE = 'employee',
  IT_ADMIN = 'it_admin',
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
}
