import path from 'path';
import logger from '../utils/logger';
import config from '../config';
import { 
  EmailProvider, 
  EmailOptions, 
  EmailResult, 
  EmailQueueItem, 
  EmailStats,
  EmailTemplateType,
  EmailTemplateData
} from '../types/email';
import { EmailProviderFactory } from './factories/EmailProviderFactory';
import { EmailTemplateEngine } from './email/templateEngine';

export class EmailService {
  private provider!: EmailProvider;
  private templateEngine: EmailTemplateEngine;
  private queue: EmailQueueItem[] = [];
  private stats: EmailStats = {
    sent: 0,
    failed: 0,
    queued: 0,
  };
  private isProcessingQueue = false;

  constructor() {
    this.initializeProvider();
    this.templateEngine = new EmailTemplateEngine(
      path.resolve(config.email.templateDir)
    );
  }

  private initializeProvider(): void {
    this.provider = EmailProviderFactory.createProvider();
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // If template is specified, render it
      if (options.templateName && options.templateData) {
        const html = await this.templateEngine.renderTemplate(
          options.templateName,
          options.templateData
        );
        options.html = html;
        
        // Generate text version if not provided
        if (!options.text) {
          options.text = this.templateEngine.htmlToText(html);
        }
      }

      // Validate that we have content to send
      if (!options.html && !options.text) {
        throw new Error('Email must have either HTML or text content');
      }

      const result = await this.provider.send(options);
      
      // Update stats
      if (result.success) {
        this.stats.sent++;
        this.stats.lastSent = new Date();
      } else {
        this.stats.failed++;
        if (result.error) {
          this.stats.lastError = result.error;
        }
      }

      return result;
    } catch (error: any) {
      logger.error('Email service send error', { error: error.message });
      
      this.stats.failed++;
      this.stats.lastError = error.message;
      
      return {
        success: false,
        error: error.message || 'Unknown email service error',
        provider: config.email.provider,
      };
    }
  }

  async sendWithTemplate<T extends EmailTemplateType>(
    templateType: T,
    to: string | string[],
    subject: string,
    templateData: EmailTemplateData[T],
    options?: Partial<EmailOptions>
  ): Promise<EmailResult> {
    // Validate template data
    if (!this.templateEngine.validateTemplateData(templateType, templateData)) {
      return {
        success: false,
        error: `Invalid template data for ${templateType}`,
        provider: config.email.provider,
      };
    }

    return this.send({
      to,
      subject,
      templateName: templateType,
      templateData,
      ...options,
    });
  }

  async queueEmail(options: EmailOptions, scheduledAt?: Date): Promise<string> {
    const queueItem: EmailQueueItem = {
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      options,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      ...(scheduledAt && { scheduledAt }),
    };

    this.queue.push(queueItem);
    this.stats.queued++;

    // Start processing queue if not already running
    if (!this.isProcessingQueue) {
      this.processQueue();
    }

    return queueItem.id;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;

    try {
      while (this.queue.length > 0) {
        const now = new Date();
        const readyItems = this.queue.filter(item => 
          !item.scheduledAt || item.scheduledAt <= now
        );

        if (readyItems.length === 0) {
          // No items ready to process, wait a bit
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        const item = readyItems[0];
        if (!item) continue;
        
        const index = this.queue.indexOf(item);

        try {
          const result = await this.send(item.options);
          
          if (result.success) {
            // Remove from queue on success
            this.queue.splice(index, 1);
            this.stats.queued--;
          } else {
            // Retry logic
            item.attempts++;
            item.lastAttemptAt = now;
            if (result.error) {
              item.error = result.error;
            }

            if (item.attempts >= item.maxAttempts) {
              // Max attempts reached, remove from queue
              this.queue.splice(index, 1);
              this.stats.queued--;
              logger.error('Email queue item failed after max attempts', { itemId: item.id, maxAttempts: item.maxAttempts, error: result.error });
            } else {
              // Schedule retry with exponential backoff
              const backoffMs = Math.pow(2, item.attempts) * 1000; // 2s, 4s, 8s, etc.
              item.scheduledAt = new Date(now.getTime() + backoffMs);
            }
          }
        } catch (error: any) {
          logger.error('Error processing queue item', { itemId: item.id, error: error.message });
          item.attempts++;
          item.lastAttemptAt = now;
          item.error = error.message;

          if (item.attempts >= item.maxAttempts) {
            this.queue.splice(index, 1);
            this.stats.queued--;
          }
        }

        // Small delay between processing items
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      return await this.provider.validateConfiguration();
    } catch (error) {
      logger.error('Email configuration validation error', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  getStats(): EmailStats {
    return { ...this.stats };
  }

  getQueueStatus(): { pending: number; items: any[] } {
    return {
      pending: this.queue.length,
      items: this.queue.map(item => ({
        id: item.id,
        attempts: item.attempts,
        maxAttempts: item.maxAttempts,
        createdAt: item.createdAt,
        scheduledAt: item.scheduledAt,
        lastAttemptAt: item.lastAttemptAt,
        error: item.error,
      })),
    };
  }

  clearQueue(): void {
    this.queue = [];
    this.stats.queued = 0;
  }

  async getAvailableTemplates(): Promise<string[]> {
    return this.templateEngine.getAvailableTemplates();
  }

  clearTemplateCache(): void {
    this.templateEngine.clearCache();
  }

  // Convenience methods for common email types
  async sendWelcomeEmail(
    to: string,
    employeeName: string,
    employeeId: string,
    department: string,
    startDate: string,
    managerName: string,
    loginUrl: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.WELCOME,
      to,
      `Welcome to the team, ${employeeName}!`,
      {
        employeeName,
        employeeId,
        department,
        startDate,
        managerName,
        loginUrl,
      }
    );
  }

  async sendLeaveRequestEmail(
    to: string,
    employeeName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    days: number,
    reason: string,
    managerName: string,
    approvalUrl: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.LEAVE_REQUEST,
      to,
      `Leave Request from ${employeeName}`,
      {
        employeeName,
        leaveType,
        fromDate,
        toDate,
        days,
        reason,
        managerName,
        approvalUrl,
      }
    );
  }

  async sendPayslipEmail(
    to: string,
    employeeName: string,
    employeeId: string,
    month: string,
    year: number,
    netPay: string,
    downloadUrl: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.PAYSLIP_GENERATED,
      to,
      `Your payslip for ${month} ${year} is ready`,
      {
        employeeName,
        employeeId,
        month,
        year,
        netPay,
        downloadUrl,
      }
    );
  }

  async sendBirthdayWish(
    to: string,
    employeeName: string,
    companyName: string,
    message?: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.BIRTHDAY_WISH,
      to,
      `Happy Birthday, ${employeeName}! 🎉`,
      {
        employeeName,
        companyName,
        ...(message && { message }),
      }
    );
  }

  async sendSystemNotification(
    to: string | string[],
    employeeName: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.SYSTEM_NOTIFICATION,
      to,
      title,
      {
        employeeName,
        title,
        message,
        ...(actionUrl && { actionUrl }),
        ...(actionText && { actionText }),
      }
    );
  }

  async sendPasswordResetEmail(
    to: string,
    employeeName: string,
    resetUrl: string,
    expiryTime: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.PASSWORD_RESET,
      to,
      'Password Reset Request',
      { employeeName, resetUrl, expiryTime }
    );
  }

  async sendLeaveApprovedEmail(
    to: string,
    employeeName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    days: number,
    approverName: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.LEAVE_APPROVED,
      to,
      `Your ${leaveType} leave has been approved`,
      { employeeName, leaveType, fromDate, toDate, days, approverName }
    );
  }

  async sendLeaveRejectedEmail(
    to: string,
    employeeName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    days: number,
    approverName: string,
    reason: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.LEAVE_REJECTED,
      to,
      `Update on your ${leaveType} leave request`,
      { employeeName, leaveType, fromDate, toDate, days, approverName, reason }
    );
  }

  async sendWorkAnniversaryEmail(
    to: string,
    employeeName: string,
    yearsOfService: number,
    joinDate: string,
    companyName: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.WORK_ANNIVERSARY,
      to,
      `Happy ${yearsOfService}-Year Work Anniversary, ${employeeName}!`,
      { employeeName, yearsOfService, joinDate, companyName }
    );
  }

  async sendInterviewScheduledEmail(
    to: string,
    candidateName: string,
    jobTitle: string,
    interviewDate: string,
    interviewTime: string,
    interviewMode: string,
    interviewerName: string,
    location?: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.INTERVIEW_SCHEDULED,
      to,
      `Interview Scheduled: ${jobTitle}`,
      {
        candidateName,
        jobTitle,
        interviewDate,
        interviewTime,
        interviewMode,
        interviewerName,
        ...(location && { location }),
      }
    );
  }

  async sendOnboardingChecklistEmail(
    to: string,
    employeeName: string,
    startDate: string,
    checklistItems: string[],
    hrContactName: string,
    hrContactEmail: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.ONBOARDING_CHECKLIST,
      to,
      `Your Onboarding Checklist — Starting ${startDate}`,
      { employeeName, startDate, checklistItems, hrContactName, hrContactEmail }
    );
  }

  async sendTrainingReminderEmail(
    to: string,
    employeeName: string,
    trainingName: string,
    trainingDate: string,
    trainingTime: string,
    location: string,
    instructor: string,
    daysRemaining: number
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.TRAINING_REMINDER,
      to,
      `Reminder: ${trainingName} — ${daysRemaining} day(s) away`,
      { employeeName, trainingName, trainingDate, trainingTime, location, instructor, daysRemaining }
    );
  }

  async sendDocumentExpiryEmail(
    to: string,
    employeeName: string,
    documentName: string,
    expiryDate: string,
    daysRemaining: number,
    actionRequired: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.DOCUMENT_EXPIRY,
      to,
      `Action Required: ${documentName} expires in ${daysRemaining} day(s)`,
      { employeeName, documentName, expiryDate, daysRemaining, actionRequired }
    );
  }

  async sendAttendanceAlertEmail(
    to: string,
    employeeName: string,
    date: string,
    alertType: 'late' | 'absent' | 'incomplete',
    managerName: string,
    actionUrl: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.ATTENDANCE_ALERT,
      to,
      `Attendance Alert: ${alertType} on ${date}`,
      { employeeName, date, alertType, managerName, actionUrl }
    );
  }

  async sendAccountCredentialsEmail(
    to: string | string[],
    employeeName: string,
    employeeId: string,
    email: string,
    temporaryPassword: string,
    loginUrl: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.ACCOUNT_CREDENTIALS,
      to,
      'Your account credentials — action required',
      { employeeName, employeeId, email, temporaryPassword, loginUrl }
    );
  }

  async sendPerformanceReviewEmail(
    to: string,
    employeeName: string,
    reviewCycle: string,
    dueDate: string,
    reviewType: 'self' | 'manager' | 'peer',
    reviewUrl: string
  ): Promise<EmailResult> {
    return this.sendWithTemplate(
      EmailTemplateType.PERFORMANCE_REVIEW,
      to,
      `Action Required: ${reviewType} Performance Review — Due ${dueDate}`,
      { employeeName, reviewCycle, dueDate, reviewType, reviewUrl }
    );
  }
}

// Export singleton instance
export const emailService = new EmailService();