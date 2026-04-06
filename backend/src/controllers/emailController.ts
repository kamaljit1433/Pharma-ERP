import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { EmailTemplateType } from '../types/email';

export class EmailController {
  /**
   * Send a simple email
   */
  async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const {
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        priority,
        replyTo,
        attachments,
      } = req.body;

      // Validate required fields
      if (!to || !subject) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: to, subject',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!text && !html) {
        res.status(400).json({
          status: 'error',
          message: 'Either text or html content is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await emailService.send({
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        priority,
        replyTo,
        attachments,
      });

      if (result.success) {
        res.status(200).json({
          status: 'success',
          message: 'Email sent successfully',
          data: {
            messageId: result.messageId,
            provider: result.provider,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to send email',
          data: {
            error: result.error,
            provider: result.provider,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplateEmail(req: Request, res: Response): Promise<void> {
    try {
      const {
        to,
        cc,
        bcc,
        subject,
        templateType,
        templateData,
        priority,
        replyTo,
      } = req.body;

      // Validate required fields
      if (!to || !subject || !templateType || !templateData) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: to, subject, templateType, templateData',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate template type
      if (!Object.values(EmailTemplateType).includes(templateType)) {
        res.status(400).json({
          status: 'error',
          message: `Invalid template type: ${templateType}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await emailService.sendWithTemplate(
        templateType,
        to,
        subject,
        templateData,
        { cc, bcc, priority, replyTo }
      );

      if (result.success) {
        res.status(200).json({
          status: 'success',
          message: 'Template email sent successfully',
          data: {
            messageId: result.messageId,
            provider: result.provider,
            templateType,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to send template email',
          data: {
            error: result.error,
            provider: result.provider,
            templateType,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error('Template email send error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Queue an email for later delivery
   */
  async queueEmail(req: Request, res: Response): Promise<void> {
    try {
      const {
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        priority,
        replyTo,
        attachments,
        scheduledAt,
      } = req.body;

      // Validate required fields
      if (!to || !subject) {
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: to, subject',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!text && !html) {
        res.status(400).json({
          status: 'error',
          message: 'Either text or html content is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const scheduledDate = scheduledAt ? new Date(scheduledAt) : undefined;
      
      const queueId = await emailService.queueEmail({
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        priority,
        replyTo,
        attachments,
      }, scheduledDate);

      res.status(200).json({
        status: 'success',
        message: 'Email queued successfully',
        data: {
          queueId,
          scheduledAt: scheduledDate,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Email queue error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get email service statistics
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = emailService.getStats();
      
      res.status(200).json({
        status: 'success',
        message: 'Email statistics retrieved successfully',
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Email stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get email queue status
   */
  async getQueueStatus(_req: Request, res: Response): Promise<void> {
    try {
      const queueStatus = emailService.getQueueStatus();
      
      res.status(200).json({
        status: 'success',
        message: 'Queue status retrieved successfully',
        data: queueStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Queue status error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Clear email queue
   */
  async clearQueue(_req: Request, res: Response): Promise<void> {
    try {
      emailService.clearQueue();
      
      res.status(200).json({
        status: 'success',
        message: 'Email queue cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Clear queue error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get available email templates
   */
  async getTemplates(_req: Request, res: Response): Promise<void> {
    try {
      const templates = await emailService.getAvailableTemplates();
      
      res.status(200).json({
        status: 'success',
        message: 'Email templates retrieved successfully',
        data: {
          templates,
          templateTypes: Object.values(EmailTemplateType),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Validate email service configuration
   */
  async validateConfiguration(_req: Request, res: Response): Promise<void> {
    try {
      const isValid = await emailService.validateConfiguration();
      
      res.status(200).json({
        status: 'success',
        message: 'Configuration validation completed',
        data: {
          isValid,
          provider: 'configured', // Don't expose actual provider details
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Configuration validation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Clear template cache
   */
  async clearTemplateCache(_req: Request, res: Response): Promise<void> {
    try {
      emailService.clearTemplateCache();
      
      res.status(200).json({
        status: 'success',
        message: 'Template cache cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Clear template cache error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send welcome email (convenience endpoint)
   */
  async sendWelcomeEmail(req: Request, res: Response): Promise<void> {
    try {
      const {
        to,
        employeeName,
        employeeId,
        department,
        startDate,
        managerName,
        loginUrl,
      } = req.body;

      // Validate required fields
      const requiredFields = ['to', 'employeeName', 'employeeId', 'department', 'startDate', 'managerName', 'loginUrl'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await emailService.sendWelcomeEmail(
        to,
        employeeName,
        employeeId,
        department,
        startDate,
        managerName,
        loginUrl
      );

      if (result.success) {
        res.status(200).json({
          status: 'success',
          message: 'Welcome email sent successfully',
          data: {
            messageId: result.messageId,
            provider: result.provider,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to send welcome email',
          data: {
            error: result.error,
            provider: result.provider,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error('Welcome email error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const emailController = new EmailController();
