import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import authService from '../services/authService';
import logger from '../utils/logger';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '../types/auth';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;

      const result = await authService.register(data);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.user.id,
          employeeId: result.user.employeeId,
          email: result.user.email,
          role: result.user.role,
        },
        tokens: result.tokens,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'Registration failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Login with email and password
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginRequest = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(data, ipAddress, userAgent);

      if (result.requiresMFA) {
        res.status(200).json({
          message: 'MFA required',
          requiresMFA: true,
        });
        return;
      }

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          employeeId: result.user.employeeId,
          email: result.user.email,
          role: result.user.role,
          mfaEnabled: result.user.mfaEnabled,
        },
        tokens: result.tokens,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          error: 'Authentication failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Refresh token is required',
        });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        tokens,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          error: 'Token refresh failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Logout user
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      await authService.logout(req.user.id);

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout failed', { error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      res.status(200).json({
        user: {
          userId: req.user.id,
          employeeId: req.user.employeeId,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } catch (error) {
      logger.error('getProfile failed', { error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMFA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const mfaSetup = await authService.setupMFA(req.user.id);

      res.status(200).json({
        message: 'MFA setup initiated',
        secret: mfaSetup.secret,
        qrCode: mfaSetup.qrCode,
        backupCodes: mfaSetup.backupCodes,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'MFA setup failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Enable MFA after verification
   */
  async enableMFA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { token }: { token: string } = req.body;

      if (!token) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Token is required',
        });
        return;
      }

      await authService.enableMFA(req.user.id, token);

      res.status(200).json({
        message: 'MFA enabled successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'MFA enable failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Disable MFA
   */
  async disableMFA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { password }: { password: string } = req.body;

      if (!password) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Password is required',
        });
        return;
      }

      await authService.disableMFA(req.user.id, password);

      res.status(200).json({
        message: 'MFA disabled successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'MFA disable failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email }: PasswordResetRequest = req.body;

      if (!email) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Email is required',
        });
        return;
      }

      await authService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      res.status(200).json({
        message: 'If the email exists, a reset link will be sent',
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword }: PasswordResetConfirm = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Token and new password are required',
        });
        return;
      }

      await authService.resetPassword(token, newPassword);

      res.status(200).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'Password reset failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * Change password
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { currentPassword, newPassword }: { currentPassword: string; newPassword: string } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Current password and new password are required',
        });
        return;
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'Password change failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }
}

export default new AuthController();
