/**
 * Notification Provider Interface
 * Implemented by: FCMProvider
 */
export interface NotificationProvider {
  sendToDevice(deviceToken: string, payload: PushNotificationPayload): Promise<string>;
  sendToMultipleDevices(deviceTokens: string[], payload: PushNotificationPayload): Promise<string[]>;
  sendToTopic(topic: string, payload: PushNotificationPayload): Promise<string>;
  subscribeToTopic(deviceTokens: string[], topic: string): Promise<void>;
  unsubscribeFromTopic(deviceTokens: string[], topic: string): Promise<void>;
}

export enum NotificationType {
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  LEAVE_PENDING = 'leave_pending',
  PAYROLL_PROCESSED = 'payroll_processed',
  PAYSLIP_READY = 'payslip_ready',
  ATTENDANCE_MARKED = 'attendance_marked',
  BIRTHDAY_WISH = 'birthday_wish',
  WORK_ANNIVERSARY = 'work_anniversary',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_LETTER_SENT = 'offer_letter_sent',
  ONBOARDING_STARTED = 'onboarding_started',
  TRAINING_ENROLLMENT = 'training_enrollment',
  CERTIFICATION_EXPIRING = 'certification_expiring',
  REIMBURSEMENT_APPROVED = 'reimbursement_approved',
  REIMBURSEMENT_REJECTED = 'reimbursement_rejected',
  PERFORMANCE_REVIEW_DUE = 'performance_review_due',
  GOAL_REMINDER = 'goal_reminder',
  SYSTEM_NOTIFICATION = 'system_notification',
}

export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
  channels: NotificationChannel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  employeeId: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string | undefined;
  image?: string | undefined;
  data?: Record<string, string> | undefined;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: Date | undefined;
  sentAt: Date;
  createdAt: Date;
}

export interface PushNotificationPayload {
  notification: {
    title: string;
    body: string;
    icon?: string | undefined;
    image?: string | undefined;
  };
  data?: Record<string, string> | undefined;
  webpush?: {
    fcmOptions?: {
      link?: string;
    };
    notification?: {
      icon?: string;
      badge?: string;
      tag?: string;
      color?: string;
      clickAction?: string;
    };
  };
}

export interface SendNotificationDTO {
  employeeId: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string | undefined;
  image?: string | undefined;
  data?: Record<string, string> | undefined;
  channels?: NotificationChannel[] | undefined;
}

export interface SendBulkNotificationDTO {
  employeeIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
  channels?: NotificationChannel[];
}

export interface SendTopicNotificationDTO {
  topic: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
}

export interface EmployeeDeviceToken {
  id: string;
  employeeId: string;
  deviceToken: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  id: string;
  employeeId: string;
  leaveNotifications: boolean;
  payrollNotifications: boolean;
  attendanceNotifications: boolean;
  birthdayNotifications: boolean;
  trainingNotifications: boolean;
  performanceNotifications: boolean;
  systemNotifications: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
