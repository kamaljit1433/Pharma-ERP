import { AxiosError } from 'axios';

/**
 * Error response structure from backend
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * User-friendly error messages for different HTTP status codes
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timeout. Please try again.',
  409: 'This action conflicts with existing data.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An internal server error occurred. Please try again later.',
  502: 'Bad gateway. The server is temporarily unavailable.',
  503: 'Service unavailable. Please try again later.',
  504: 'Gateway timeout. The server took too long to respond.',
};

/**
 * Get user-friendly error message from error object
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const response = error.response;

    if (response) {
      const data = response.data as ApiErrorResponse;

      // Use backend error message if available
      if (data?.message) {
        return data.message;
      }

      // Use predefined message for status code
      const statusMessage = ERROR_MESSAGES[response.status];
      if (statusMessage) {
        return statusMessage;
      }

      return `Request failed with status ${response.status}`;
    }

    // Network error
    if (error.request) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Request setup error
    return error.message || 'Failed to send request';
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Get validation errors from API response
 */
export const getValidationErrors = (error: unknown): Record<string, string[]> | null => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;
    return data?.errors || null;
  }
  return null;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && !!error.request;
  }
  return false;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
};

/**
 * Check if error is a permission error (403)
 */
export const isPermissionError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 403;
  }
  return false;
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 404;
  }
  return false;
};

/**
 * Check if error is a server error (5xx)
 */
export const isServerError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status !== undefined && status >= 500 && status < 600;
  }
  return false;
};

/**
 * Log error for debugging
 */
export const logError = (error: unknown, context?: string): void => {
  const message = getErrorMessage(error);
  const prefix = context ? `[${context}]` : '[Error]';

  console.error(`${prefix} ${message}`, error);

  // In production, you might want to send errors to a logging service
  // Example: sendToLoggingService(error, context);
};

/**
 * Handle API error with toast notification
 * This function should be called from components that have access to toast
 */
export interface ToastFunction {
  (options: {
    title: string;
    description?: string;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }): void;
}

export const handleApiError = (error: unknown, toast: ToastFunction, context?: string): void => {
  const message = getErrorMessage(error);

  // Log error for debugging
  logError(error, context);

  // Show toast notification
  toast({
    title: 'Error',
    description: message,
    variant: 'error',
    duration: 5000,
  });
};

/**
 * Handle API success with toast notification
 */
export const handleApiSuccess = (message: string, toast: ToastFunction): void => {
  toast({
    title: 'Success',
    description: message,
    variant: 'success',
    duration: 3000,
  });
};
