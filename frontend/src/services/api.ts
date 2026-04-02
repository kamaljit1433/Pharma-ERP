import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to calculate exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
};

// Helper function to determine if request should be retried
const shouldRetry = (error: AxiosError): boolean => {
  // Don't retry if request was cancelled
  if (axios.isCancel(error)) {
    return false;
  }

  // Don't retry client errors (4xx) except 408 (timeout) and 429 (rate limit)
  if (error.response) {
    const status = error.response.status;
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }
  }

  // Retry network errors and 5xx errors
  return true;
};

// Request interceptor - Add auth token and retry config
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auth token will be handled by httpOnly cookies
    // Initialize retry count if not present
    if (!config.headers['X-Retry-Count']) {
      config.headers['X-Retry-Count'] = '0';
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and retries
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0;
    }

    // Check if we should retry
    if (shouldRetry(error) && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      config.headers['X-Retry-Count'] = config._retryCount.toString();

      // Calculate delay with exponential backoff
      const delay = getRetryDelay(config._retryCount - 1);

      // Log retry attempt
      console.log(
        `Retrying request (attempt ${config._retryCount}/${MAX_RETRIES}) after ${delay}ms:`,
        config.url
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return apiClient(config);
    }

    // Handle specific error codes after retries exhausted
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data as any;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('Unauthorized access - redirecting to login');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', errorData?.message || 'You do not have permission to access this resource');
          break;
        case 404:
          // Not found
          console.error('Resource not found:', errorData?.message || 'The requested resource was not found');
          break;
        case 500:
          // Server error
          console.error('Server error:', errorData?.message || 'An internal server error occurred');
          break;
        default:
          console.error('API error:', errorData?.message || 'An error occurred');
      }
    } else if (axios.isCancel(error)) {
      // Request was cancelled
      console.log('Request cancelled:', error.message);
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
    } else {
      // Other errors
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Export abort controller creator for request cancellation
export const createCancelToken = () => {
  return new AbortController();
};

export default apiClient;
