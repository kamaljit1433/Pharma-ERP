interface UserBase {
  id: string;
  employeeId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  refreshTokenVersion: number;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMfaEnabled extends UserBase {
  mfaEnabled: true;
  mfaSecret: string;
}

interface UserMfaDisabled extends UserBase {
  mfaEnabled: false;
  mfaSecret?: undefined;
}

// Pending state: setupMFA stores the secret before enableMFA is confirmed
interface UserMfaPending extends UserBase {
  mfaEnabled: false;
  mfaSecret: string;
}

export type User = UserMfaEnabled | UserMfaDisabled | UserMfaPending;

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HR_MANAGER = 'hr_manager',
  DEPARTMENT_MANAGER = 'department_manager',
  FINANCE = 'finance',
  EMPLOYEE = 'employee',
  IT_ADMIN = 'it_admin',
}

export interface TokenPayload {
  userId: string;
  employeeId: string;
  email: string;
  role: UserRole;
  tokenVersion?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaToken?: string;
}

export interface RegisterRequest {
  employeeId: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface MFAVerifyRequest {
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface OAuthProfile {
  id: string;
  email: string;
  displayName: string;
  provider: 'google' | 'microsoft';
}

export interface CreateUserDTO {
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  employee_id?: string;
}

export interface UpdateUserDTO {
  email?: string;
  password_hash?: string;
  role?: string;
  is_active?: boolean;
}
