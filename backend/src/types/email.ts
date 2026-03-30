export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string; // Content-ID for inline attachments
}

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  templateName?: string;
  templateData?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  replyTo?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<EmailResult>;
  validateConfiguration(): Promise<boolean>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface EmailServiceConfig {
  provider: 'sendgrid' | 'ses' | 'smtp';
  fromName: string;
  fromAddress: string;
  sendgrid: {
    apiKey: string;
  };
  ses: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  templateDir: string;
}

export interface EmailQueueItem {
  id: string;
  options: EmailOptions;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt?: Date;
  lastAttemptAt?: Date;
  error?: string;
}

export interface EmailStats {
  sent: number;
  failed: number;
  queued: number;
  lastSent?: Date;
  lastError?: string;
}

// Common email templates used in the EMS
export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  LEAVE_REQUEST = 'leave-request',
  LEAVE_APPROVED = 'leave-approved',
  LEAVE_REJECTED = 'leave-rejected',
  PAYSLIP_GENERATED = 'payslip-generated',
  BIRTHDAY_WISH = 'birthday-wish',
  WORK_ANNIVERSARY = 'work-anniversary',
  INTERVIEW_SCHEDULED = 'interview-scheduled',
  OFFER_LETTER = 'offer-letter',
  ONBOARDING_CHECKLIST = 'onboarding-checklist',
  TRAINING_REMINDER = 'training-reminder',
  DOCUMENT_EXPIRY = 'document-expiry',
  ATTENDANCE_ALERT = 'attendance-alert',
  PERFORMANCE_REVIEW = 'performance-review',
  SYSTEM_NOTIFICATION = 'system-notification'
}

export interface EmailTemplateData {
  [EmailTemplateType.WELCOME]: {
    employeeName: string;
    employeeId: string;
    department: string;
    startDate: string;
    managerName: string;
    loginUrl: string;
  };
  [EmailTemplateType.PASSWORD_RESET]: {
    employeeName: string;
    resetUrl: string;
    expiryTime: string;
  };
  [EmailTemplateType.LEAVE_REQUEST]: {
    employeeName: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
    managerName: string;
    approvalUrl: string;
  };
  [EmailTemplateType.LEAVE_APPROVED]: {
    employeeName: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    approverName: string;
    comments?: string;
  };
  [EmailTemplateType.LEAVE_REJECTED]: {
    employeeName: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    approverName: string;
    reason: string;
  };
  [EmailTemplateType.PAYSLIP_GENERATED]: {
    employeeName: string;
    employeeId: string;
    month: string;
    year: number;
    netPay: string;
    downloadUrl: string;
  };
  [EmailTemplateType.BIRTHDAY_WISH]: {
    employeeName: string;
    companyName: string;
    message?: string;
  };
  [EmailTemplateType.WORK_ANNIVERSARY]: {
    employeeName: string;
    yearsOfService: number;
    joinDate: string;
    companyName: string;
    message?: string;
  };
  [EmailTemplateType.INTERVIEW_SCHEDULED]: {
    candidateName: string;
    jobTitle: string;
    interviewDate: string;
    interviewTime: string;
    interviewMode: string;
    interviewerName: string;
    meetingLink?: string;
    location?: string;
  };
  [EmailTemplateType.OFFER_LETTER]: {
    candidateName: string;
    jobTitle: string;
    department: string;
    salary: string;
    startDate: string;
    reportingManager: string;
    offerValidTill: string;
    acceptanceUrl: string;
  };
  [EmailTemplateType.ONBOARDING_CHECKLIST]: {
    employeeName: string;
    startDate: string;
    checklistItems: string[];
    hrContactName: string;
    hrContactEmail: string;
  };
  [EmailTemplateType.TRAINING_REMINDER]: {
    employeeName: string;
    trainingName: string;
    trainingDate: string;
    trainingTime: string;
    location: string;
    instructor: string;
    daysRemaining: number;
  };
  [EmailTemplateType.DOCUMENT_EXPIRY]: {
    employeeName: string;
    documentName: string;
    expiryDate: string;
    daysRemaining: number;
    actionRequired: string;
  };
  [EmailTemplateType.ATTENDANCE_ALERT]: {
    employeeName: string;
    date: string;
    alertType: 'late' | 'absent' | 'incomplete';
    managerName: string;
    actionUrl: string;
  };
  [EmailTemplateType.PERFORMANCE_REVIEW]: {
    employeeName: string;
    reviewCycle: string;
    dueDate: string;
    reviewType: 'self' | 'manager' | 'peer';
    reviewUrl: string;
  };
  [EmailTemplateType.SYSTEM_NOTIFICATION]: {
    employeeName: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  };
}