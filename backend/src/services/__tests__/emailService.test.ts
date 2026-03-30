import { EmailService } from '../emailService';
import { EmailTemplateType } from '../../types/email';

// Mock the config
jest.mock('../../config', () => ({
  email: {
    provider: 'smtp',
    fromName: 'Test EMS',
    fromAddress: 'test@example.com',
    sendgrid: { apiKey: '' },
    ses: { region: 'us-east-1', accessKeyId: '', secretAccessKey: '' },
    smtp: {
      host: 'localhost',
      port: 587,
      secure: false,
      user: 'test@example.com',
      password: 'password',
    },
    templateDir: 'src/templates/email',
  },
}));

// Mock the providers
jest.mock('../email/providers/smtpProvider', () => ({
  SMTPProvider: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
      provider: 'smtp',
    }),
    validateConfiguration: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock the template engine
jest.mock('../email/templateEngine', () => ({
  EmailTemplateEngine: jest.fn().mockImplementation(() => ({
    renderTemplate: jest.fn().mockResolvedValue('<html><body>Test Template</body></html>'),
    htmlToText: jest.fn().mockReturnValue('Test Template'),
    validateTemplateData: jest.fn().mockReturnValue(true),
    getAvailableTemplates: jest.fn().mockResolvedValue(['welcome', 'leave-request']),
    clearCache: jest.fn(),
  })),
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  describe('send', () => {
    it('should send email successfully', async () => {
      const result = await emailService.send({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test message',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(result.provider).toBe('smtp');
    });

    it('should render template when templateName is provided', async () => {
      const result = await emailService.send({
        to: 'test@example.com',
        subject: 'Test Email',
        templateName: 'welcome',
        templateData: { employeeName: 'John Doe' },
      });

      expect(result.success).toBe(true);
    });

    it('should fail when no content is provided', async () => {
      const result = await emailService.send({
        to: 'test@example.com',
        subject: 'Test Email',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('must have either HTML or text content');
    });
  });

  describe('sendWithTemplate', () => {
    it('should send welcome email with template', async () => {
      const result = await emailService.sendWithTemplate(
        EmailTemplateType.WELCOME,
        'test@example.com',
        'Welcome!',
        {
          employeeName: 'John Doe',
          employeeId: 'EMP001',
          department: 'Engineering',
          startDate: '2024-01-15',
          managerName: 'Jane Smith',
          loginUrl: 'https://example.com/login',
        }
      );

      expect(result.success).toBe(true);
    });

    it('should validate template data', async () => {
      // Mock validation to return false
      const mockTemplateEngine = emailService['templateEngine'];
      (mockTemplateEngine.validateTemplateData as jest.Mock).mockReturnValue(false);

      const result = await emailService.sendWithTemplate(
        EmailTemplateType.WELCOME,
        'test@example.com',
        'Welcome!',
        {} as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid template data');
    });
  });

  describe('queueEmail', () => {
    it('should queue email for later processing', async () => {
      const queueId = await emailService.queueEmail({
        to: 'test@example.com',
        subject: 'Queued Email',
        text: 'This is a queued message',
      });

      expect(queueId).toMatch(/^email_\d+_[a-z0-9]+$/);
      
      const queueStatus = emailService.getQueueStatus();
      expect(queueStatus.pending).toBe(1);
    });

    it('should schedule email for future delivery', async () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      
      const queueId = await emailService.queueEmail({
        to: 'test@example.com',
        subject: 'Scheduled Email',
        text: 'This is a scheduled message',
      }, futureDate);

      expect(queueId).toBeDefined();
      
      const queueStatus = emailService.getQueueStatus();
      expect(queueStatus.pending).toBe(1);
      expect(queueStatus.items[0]?.scheduledAt).toEqual(futureDate);
    });
  });

  describe('validateConfiguration', () => {
    it('should validate email provider configuration', async () => {
      const isValid = await emailService.validateConfiguration();
      expect(isValid).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return email statistics', () => {
      const stats = emailService.getStats();
      
      expect(stats).toHaveProperty('sent');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('queued');
      expect(typeof stats.sent).toBe('number');
      expect(typeof stats.failed).toBe('number');
      expect(typeof stats.queued).toBe('number');
    });
  });

  describe('convenience methods', () => {
    it('should send welcome email', async () => {
      const result = await emailService.sendWelcomeEmail(
        'test@example.com',
        'John Doe',
        'EMP001',
        'Engineering',
        '2024-01-15',
        'Jane Smith',
        'https://example.com/login'
      );

      expect(result.success).toBe(true);
    });

    it('should send leave request email', async () => {
      const result = await emailService.sendLeaveRequestEmail(
        'manager@example.com',
        'John Doe',
        'Annual Leave',
        '2024-02-01',
        '2024-02-05',
        5,
        'Family vacation',
        'Jane Smith',
        'https://example.com/approve'
      );

      expect(result.success).toBe(true);
    });

    it('should send payslip email', async () => {
      const result = await emailService.sendPayslipEmail(
        'test@example.com',
        'John Doe',
        'EMP001',
        'January',
        2024,
        '$5,000.00',
        'https://example.com/payslip'
      );

      expect(result.success).toBe(true);
    });

    it('should send birthday wish email', async () => {
      const result = await emailService.sendBirthdayWish(
        'test@example.com',
        'John Doe',
        'Acme Corp',
        'Hope you have a wonderful day!'
      );

      expect(result.success).toBe(true);
    });

    it('should send system notification email', async () => {
      const result = await emailService.sendSystemNotification(
        'test@example.com',
        'John Doe',
        'System Maintenance',
        'The system will be down for maintenance tonight.',
        'https://example.com/status',
        'Check Status'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('template management', () => {
    it('should get available templates', async () => {
      const templates = await emailService.getAvailableTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates).toContain('welcome');
      expect(templates).toContain('leave-request');
    });

    it('should clear template cache', () => {
      expect(() => emailService.clearTemplateCache()).not.toThrow();
    });
  });

  describe('queue management', () => {
    it('should get queue status', () => {
      const status = emailService.getQueueStatus();
      
      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('items');
      expect(typeof status.pending).toBe('number');
      expect(Array.isArray(status.items)).toBe(true);
    });

    it('should clear queue', () => {
      emailService.clearQueue();
      
      const status = emailService.getQueueStatus();
      expect(status.pending).toBe(0);
      expect(status.items).toHaveLength(0);
    });
  });
});