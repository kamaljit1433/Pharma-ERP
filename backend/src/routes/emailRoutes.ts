import { Router, RequestHandler } from 'express';
import { emailController } from '../controllers/emailController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all email routes
router.use(authenticateToken as RequestHandler);

/**
 * @route POST /api/v1/email/send
 * @desc Send a simple email
 * @access Private
 * @body {
 *   to: string | string[],
 *   cc?: string | string[],
 *   bcc?: string | string[],
 *   subject: string,
 *   text?: string,
 *   html?: string,
 *   priority?: 'high' | 'normal' | 'low',
 *   replyTo?: string,
 *   attachments?: EmailAttachment[]
 * }
 */
router.post('/send', emailController.sendEmail.bind(emailController));

/**
 * @route POST /api/v1/email/send-template
 * @desc Send email using a template
 * @access Private
 * @body {
 *   to: string | string[],
 *   cc?: string | string[],
 *   bcc?: string | string[],
 *   subject: string,
 *   templateType: EmailTemplateType,
 *   templateData: Record<string, any>,
 *   priority?: 'high' | 'normal' | 'low',
 *   replyTo?: string
 * }
 */
router.post('/send-template', emailController.sendTemplateEmail.bind(emailController));

/**
 * @route POST /api/v1/email/queue
 * @desc Queue an email for later delivery
 * @access Private
 * @body {
 *   to: string | string[],
 *   cc?: string | string[],
 *   bcc?: string | string[],
 *   subject: string,
 *   text?: string,
 *   html?: string,
 *   priority?: 'high' | 'normal' | 'low',
 *   replyTo?: string,
 *   attachments?: EmailAttachment[],
 *   scheduledAt?: string (ISO date)
 * }
 */
router.post('/queue', emailController.queueEmail.bind(emailController));

/**
 * @route GET /api/v1/email/stats
 * @desc Get email service statistics
 * @access Private
 */
router.get('/stats', emailController.getStats.bind(emailController));

/**
 * @route GET /api/v1/email/queue/status
 * @desc Get email queue status
 * @access Private
 */
router.get('/queue/status', emailController.getQueueStatus.bind(emailController));

/**
 * @route DELETE /api/v1/email/queue
 * @desc Clear email queue
 * @access Private (Admin only)
 */
router.delete('/queue', emailController.clearQueue.bind(emailController));

/**
 * @route GET /api/v1/email/templates
 * @desc Get available email templates
 * @access Private
 */
router.get('/templates', emailController.getTemplates.bind(emailController));

/**
 * @route POST /api/v1/email/validate-config
 * @desc Validate email service configuration
 * @access Private (Admin only)
 */
router.post('/validate-config', emailController.validateConfiguration.bind(emailController));

/**
 * @route DELETE /api/v1/email/templates/cache
 * @desc Clear template cache
 * @access Private (Admin only)
 */
router.delete('/templates/cache', emailController.clearTemplateCache.bind(emailController));

/**
 * @route POST /api/v1/email/welcome
 * @desc Send welcome email (convenience endpoint)
 * @access Private
 * @body {
 *   to: string,
 *   employeeName: string,
 *   employeeId: string,
 *   department: string,
 *   startDate: string,
 *   managerName: string,
 *   loginUrl: string
 * }
 */
router.post('/welcome', emailController.sendWelcomeEmail.bind(emailController));

export default router;
