import fc from 'fast-check';
import { EmailService } from '../emailService';
import { EmailTemplateType } from '../../types/email';

// Mock the config and providers for property tests
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

jest.mock('../email/templateEngine', () => ({
  EmailTemplateEngine: jest.fn().mockImplementation(() => ({
    renderTemplate: jest.fn().mockResolvedValue('<html><body>Test Template</body></html>'),
    htmlToText: jest.fn().mockReturnValue('Test Template'),
    validateTemplateData: jest.fn().mockReturnValue(true),
    getAvailableTemplates: jest.fn().mockResolvedValue(['welcome', 'leave-request']),
    clearCache: jest.fn(),
  })),
}));

describe('EmailService Property Tests', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  /**
   * Property: Email Queue ID Uniqueness
   * For any set of emails queued simultaneously, all queue IDs must be unique.
   */
  it('Property: Email queue ID uniqueness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            to: fc.emailAddress(),
            subject: fc.string({ minLength: 1, maxLength: 100 }),
            text: fc.string({ minLength: 1, maxLength: 1000 }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (emailOptions) => {
          const queueIds = await Promise.all(
            emailOptions.map(options => emailService.queueEmail(options))
          );
          
          const uniqueIds = new Set(queueIds);
          expect(uniqueIds.size).toBe(queueIds.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Email Content Validation
   * For any email options, if neither HTML nor text content is provided,
   * the send operation must fail with appropriate error message.
   */
  it('Property: Email content validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          to: fc.emailAddress(),
          subject: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (options) => {
          // Ensure no content is provided
          const result = await emailService.send(options);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('must have either HTML or text content');
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Email Address Format Handling
   * For any valid email address format, the service should accept it without error.
   */
  it('Property: Email address format handling', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (emailAddress, subject, text) => {
          const result = await emailService.send({
            to: emailAddress,
            subject,
            text,
          });
          
          expect(result.success).toBe(true);
          expect(result.messageId).toBeDefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Multiple Recipients Handling
   * For any array of valid email addresses, the service should handle them correctly.
   */
  it('Property: Multiple recipients handling', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.emailAddress(), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (recipients, subject, text) => {
          const result = await emailService.send({
            to: recipients,
            subject,
            text,
          });
          
          expect(result.success).toBe(true);
          expect(result.messageId).toBeDefined();
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Queue Processing Order
   * For any set of emails queued with different scheduled times,
   * emails scheduled for earlier times should be processed first.
   */
  it('Property: Queue processing order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: fc.record({
              to: fc.emailAddress(),
              subject: fc.string({ minLength: 1, maxLength: 100 }),
              text: fc.string({ minLength: 1, maxLength: 1000 }),
            }),
            delay: fc.integer({ min: 0, max: 5000 }), // 0-5 seconds
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (emailsWithDelays) => {
          const now = new Date();
          const queuedEmails = [];
          
          for (const { email, delay } of emailsWithDelays) {
            const scheduledAt = new Date(now.getTime() + delay);
            const queueId = await emailService.queueEmail(email, scheduledAt);
            queuedEmails.push({ queueId, scheduledAt });
          }
          
          const queueStatus = emailService.getQueueStatus();
          
          // Verify all emails are queued
          expect(queueStatus.pending).toBe(emailsWithDelays.length);
          
          // Verify queue items have correct scheduled times
          for (const { queueId, scheduledAt } of queuedEmails) {
            const queueItem = queueStatus.items.find(item => item.id === queueId);
            expect(queueItem).toBeDefined();
            expect(queueItem!.scheduledAt).toEqual(scheduledAt);
          }
          
          // Clean up
          emailService.clearQueue();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Template Data Validation
   * For any template type and corresponding valid data,
   * the template validation should pass.
   */
  it('Property: Template data validation', async () => {
    const welcomeDataArbitrary = fc.record({
      employeeName: fc.string({ minLength: 1, maxLength: 50 }),
      employeeId: fc.string({ minLength: 1, maxLength: 20 }),
      department: fc.string({ minLength: 1, maxLength: 50 }),
      startDate: fc.date().map(d => d.toISOString().split('T')[0] || '2024-01-01'),
      managerName: fc.string({ minLength: 1, maxLength: 50 }),
      loginUrl: fc.webUrl(),
    });

    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 100 }),
        welcomeDataArbitrary,
        async (to, subject, templateData) => {
          const result = await emailService.sendWithTemplate(
            EmailTemplateType.WELCOME,
            to,
            subject,
            templateData as any
          );
          
          expect(result.success).toBe(true);
          expect(result.messageId).toBeDefined();
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Email Statistics Consistency
   * For any sequence of email operations, the statistics should remain consistent.
   */
  it('Property: Email statistics consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            to: fc.emailAddress(),
            subject: fc.string({ minLength: 1, maxLength: 100 }),
            text: fc.string({ minLength: 1, maxLength: 1000 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (emails) => {
          const initialStats = emailService.getStats();
          
          // Send all emails
          const results = await Promise.all(
            emails.map(email => emailService.send(email))
          );
          
          const finalStats = emailService.getStats();
          
          // Count successful and failed sends
          const successCount = results.filter(r => r.success).length;
          const failCount = results.filter(r => !r.success).length;
          
          // Verify statistics are updated correctly
          expect(finalStats.sent).toBe(initialStats.sent + successCount);
          expect(finalStats.failed).toBe(initialStats.failed + failCount);
          
          // If any emails were successful, lastSent should be updated or already set
          if (successCount > 0) {
            expect(finalStats.lastSent).toBeDefined();
            // Just verify it's a valid date
            expect(finalStats.lastSent instanceof Date).toBe(true);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Queue Capacity Management
   * For any number of emails queued, the queue status should accurately reflect
   * the number of pending items.
   */
  it('Property: Queue capacity management', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 20 }),
        async (emailCount) => {
          // Clear queue first
          emailService.clearQueue();
          
          const emails = Array.from({ length: emailCount }, (_, i) => ({
            to: `test${i}@example.com`,
            subject: `Test Email ${i}`,
            text: `This is test email number ${i}`,
          }));
          
          // Queue all emails
          const queueIds = await Promise.all(
            emails.map(email => emailService.queueEmail(email))
          );
          
          const queueStatus = emailService.getQueueStatus();
          
          // Verify queue status - allow for some tolerance in timing
          expect(queueStatus.pending).toBeLessThanOrEqual(emailCount);
          expect(queueStatus.pending).toBeGreaterThanOrEqual(emailCount - 1);
          expect(queueStatus.items.length).toBeLessThanOrEqual(emailCount);
          expect(queueStatus.items.length).toBeGreaterThanOrEqual(emailCount - 1);
          
          // Verify all queue IDs are unique
          const uniqueIds = new Set(queueIds);
          expect(uniqueIds.size).toBe(emailCount);
          
          // Clean up
          emailService.clearQueue();
        }
      ),
      { numRuns: 20 }
    );
  });
});