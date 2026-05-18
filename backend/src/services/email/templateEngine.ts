import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { EmailTemplate, EmailTemplateType } from '../../types/email';

export class EmailTemplateEngine {
  private templateCache: Map<string, Handlebars.TemplateDelegate> = new Map();
  private templateDir: string;

  constructor(templateDir: string) {
    this.templateDir = templateDir;
    this.registerHelpers();
  }

  private registerHelpers(): void {
    // Register common Handlebars helpers
    Handlebars.registerHelper('formatDate', (date: Date | string, format?: string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!d || isNaN(d.getTime())) return '';
      
      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        case 'time':
          return d.toLocaleTimeString();
        default:
          return d.toLocaleDateString();
      }
    });

    Handlebars.registerHelper('formatCurrency', (amount: number | string, currency = 'USD') => {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num)) return '';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(num);
    });

    Handlebars.registerHelper('pluralize', (count: number, singular: string, plural?: string) => {
      if (count === 1) return singular;
      return plural || `${singular}s`;
    });

    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    Handlebars.registerHelper('and', (a: any, b: any) => a && b);
    Handlebars.registerHelper('or', (a: any, b: any) => a || b);

    Handlebars.registerHelper('ifCond', function(this: any, v1: any, operator: string, v2: any, options: any): string {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    });
  }

  async loadTemplate(templateName: string): Promise<Handlebars.TemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    try {
      const templatePath = path.join(this.templateDir, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateContent);
      
      // Cache the compiled template
      this.templateCache.set(templateName, compiledTemplate);
      
      return compiledTemplate;
    } catch (error) {
      console.error(`Failed to load email template: ${templateName}`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return template(data);
  }

  async getAvailableTemplates(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.templateDir);
      return files
        .filter(file => file.endsWith('.hbs'))
        .map(file => file.replace('.hbs', ''));
    } catch (error) {
      console.error('Failed to list email templates:', error);
      return [];
    }
  }

  clearCache(): void {
    this.templateCache.clear();
  }

  // Generate text version from HTML template
  htmlToText(html: string): string {
    return html
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Convert HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Create a basic template programmatically
  createTemplate(name: string, subject: string, html: string, text?: string): EmailTemplate {
    return {
      name,
      subject,
      html,
      text: text || this.htmlToText(html),
    };
  }

  // Validate template data against expected fields
  validateTemplateData(templateType: EmailTemplateType, data: Record<string, any>): boolean {
    const requiredFields: Record<EmailTemplateType, string[]> = {
      [EmailTemplateType.WELCOME]: ['employeeName', 'employeeId', 'department', 'startDate', 'managerName', 'loginUrl'],
      [EmailTemplateType.PASSWORD_RESET]: ['employeeName', 'resetUrl', 'expiryTime'],
      [EmailTemplateType.LEAVE_REQUEST]: ['employeeName', 'leaveType', 'fromDate', 'toDate', 'days', 'reason', 'managerName', 'approvalUrl'],
      [EmailTemplateType.LEAVE_APPROVED]: ['employeeName', 'leaveType', 'fromDate', 'toDate', 'days', 'approverName'],
      [EmailTemplateType.LEAVE_REJECTED]: ['employeeName', 'leaveType', 'fromDate', 'toDate', 'days', 'approverName', 'reason'],
      [EmailTemplateType.PAYSLIP_GENERATED]: ['employeeName', 'employeeId', 'month', 'year', 'netPay', 'downloadUrl'],
      [EmailTemplateType.BIRTHDAY_WISH]: ['employeeName', 'companyName'],
      [EmailTemplateType.WORK_ANNIVERSARY]: ['employeeName', 'yearsOfService', 'joinDate', 'companyName'],
      [EmailTemplateType.INTERVIEW_SCHEDULED]: ['candidateName', 'jobTitle', 'interviewDate', 'interviewTime', 'interviewMode', 'interviewerName'],
      [EmailTemplateType.OFFER_LETTER]: ['candidateName', 'jobTitle', 'department', 'salary', 'startDate', 'reportingManager', 'offerValidTill', 'acceptanceUrl'],
      [EmailTemplateType.ONBOARDING_CHECKLIST]: ['employeeName', 'startDate', 'checklistItems', 'hrContactName', 'hrContactEmail'],
      [EmailTemplateType.TRAINING_REMINDER]: ['employeeName', 'trainingName', 'trainingDate', 'trainingTime', 'location', 'instructor', 'daysRemaining'],
      [EmailTemplateType.DOCUMENT_EXPIRY]: ['employeeName', 'documentName', 'expiryDate', 'daysRemaining', 'actionRequired'],
      [EmailTemplateType.ATTENDANCE_ALERT]: ['employeeName', 'date', 'alertType', 'managerName', 'actionUrl'],
      [EmailTemplateType.PERFORMANCE_REVIEW]: ['employeeName', 'reviewCycle', 'dueDate', 'reviewType', 'reviewUrl'],
      [EmailTemplateType.SYSTEM_NOTIFICATION]: ['employeeName', 'title', 'message'],
      [EmailTemplateType.ACCOUNT_CREDENTIALS]: ['employeeName', 'employeeId', 'email', 'temporaryPassword', 'loginUrl'],
    };

    const required = requiredFields[templateType];
    if (!required) return true; // Unknown template type, assume valid

    return required.every(field => data.hasOwnProperty(field) && data[field] !== undefined && data[field] !== null);
  }
}