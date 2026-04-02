// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const API_TIMEOUT = 30000;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Toast Duration
export const TOAST_DURATION = 5000;

// Cache Duration
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce Delay
export const SEARCH_DEBOUNCE_DELAY = 300;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR_MANAGER: 'hr_manager',
  DEPARTMENT_MANAGER: 'department_manager',
  FINANCE: 'finance',
  EMPLOYEE: 'employee',
  IT_ADMIN: 'it_admin',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Theme
export const THEME_KEY = 'ems-theme';
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
