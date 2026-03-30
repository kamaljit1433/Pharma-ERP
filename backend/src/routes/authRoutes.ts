import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import passport from '../config/passport';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate refresh tokens)
 * @access  Private
 */
router.post('/logout', authenticateToken as any, authController.logout as any);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken as any, authController.getProfile as any);

/**
 * @route   POST /api/v1/auth/mfa/setup
 * @desc    Setup MFA for user
 * @access  Private
 */
router.post('/mfa/setup', authenticateToken as any, authController.setupMFA as any);

/**
 * @route   POST /api/v1/auth/mfa/enable
 * @desc    Enable MFA after verification
 * @access  Private
 */
router.post('/mfa/enable', authenticateToken as any, authController.enableMFA as any);

/**
 * @route   POST /api/v1/auth/mfa/disable
 * @desc    Disable MFA
 * @access  Private
 */
router.post('/mfa/disable', authenticateToken as any, authController.disableMFA as any);

/**
 * @route   POST /api/v1/auth/password/reset-request
 * @desc    Request password reset
 * @access  Public
 */
router.post('/password/reset-request', authController.requestPasswordReset);

/**
 * @route   POST /api/v1/auth/password/reset
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/password/reset', authController.resetPassword);

/**
 * @route   POST /api/v1/auth/password/change
 * @desc    Change password (requires current password)
 * @access  Private
 */
router.post('/password/change', authenticateToken as any, authController.changePassword as any);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // User is attached by passport
      const user = req.user as any;
      
      if (!user) {
        res.redirect('/login?error=oauth_failed');
        return;
      }

      // Generate tokens
      const authService = (await import('../services/authService')).default;
      const tokens = await authService.refreshToken(user.id);

      // Redirect to frontend with tokens
      const frontendUrl = process.env['FRONTEND_URL'] || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`);
    } catch (error) {
      res.redirect('/login?error=oauth_failed');
    }
  }
);

export default router;
