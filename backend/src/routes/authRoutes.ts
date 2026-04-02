import { Router, RequestHandler } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { generateTokenPair } from '../utils/jwt';
import { TokenPayload } from '../types/auth';
import passport from '../config/passport';

const router = Router();

const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:5173';
const FRONTEND_LOGIN_PATH = process.env['FRONTEND_LOGIN_PATH'] || '/login';
const FRONTEND_OAUTH_CALLBACK_PATH = process.env['FRONTEND_OAUTH_CALLBACK_PATH'] || '/auth/callback';

// Cast authenticated controller methods to RequestHandler.
// authenticateToken sets req.user before these handlers run.
const withAuth = (handler: RequestHandler): RequestHandler => handler;

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
router.post('/logout', authenticateToken, withAuth(authController.logout as unknown as RequestHandler));

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, withAuth(authController.getProfile as unknown as RequestHandler));

/**
 * @route   POST /api/v1/auth/mfa/setup
 * @desc    Setup MFA for user
 * @access  Private
 */
router.post('/mfa/setup', authenticateToken, withAuth(authController.setupMFA as unknown as RequestHandler));

/**
 * @route   POST /api/v1/auth/mfa/enable
 * @desc    Enable MFA after verification
 * @access  Private
 */
router.post('/mfa/enable', authenticateToken, withAuth(authController.enableMFA as unknown as RequestHandler));

/**
 * @route   POST /api/v1/auth/mfa/disable
 * @desc    Disable MFA
 * @access  Private
 */
router.post('/mfa/disable', authenticateToken, withAuth(authController.disableMFA as unknown as RequestHandler));

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
router.post('/password/change', authenticateToken, withAuth(authController.changePassword as unknown as RequestHandler));

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
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${FRONTEND_URL}${FRONTEND_LOGIN_PATH}?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const userPayload = req.user as TokenPayload;

      if (!userPayload) {
        res.redirect(`${FRONTEND_URL}${FRONTEND_LOGIN_PATH}?error=oauth_failed`);
        return;
      }

      // Generate tokens using the payload already set by the Passport strategy
      const tokens = generateTokenPair(userPayload);

      // Deliver tokens via httpOnly cookies so they are not exposed in URL, browser history,
      // referrer headers, or proxy logs (Issue #1 fix).
      const isProduction = process.env['NODE_ENV'] === 'production';
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect(`${FRONTEND_URL}${FRONTEND_OAUTH_CALLBACK_PATH}`);
    } catch {
      res.redirect(`${FRONTEND_URL}${FRONTEND_LOGIN_PATH}?error=oauth_failed`);
    }
  }
);

export default router;
