import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Axios error with response
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // HTTP status code messages
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'You are not authorized. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This action conflicts with existing data.';
        case 422:
          return 'The provided data is invalid.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'A server error occurred. Please try again later.';
        case 503:
          return 'The service is temporarily unavailable. Please try again later.';
        default:
          return `An error occurred (${axiosError.response.status}).`;
      }
    }
  }
  
  // Network error
  if (error instanceof Error && error.message === 'Network Error') {
    return 'Network error. Please check your internet connection.';
  }
  
  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // String error
  if (typeof error === 'string') {
    return error;
  }
  
  // Unknown error
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Shows an error toast with a user-friendly message
 */
export function showErrorToast(error: unknown, title: string = 'Error') {
  const message = getErrorMessage(error);
  toast.error(title, {
    description: message,
    duration: 5000,
  });
}

/**
 * Shows a success toast
 */
export function showSuccessToast(title: string, description?: string) {
  toast.success(title, {
    description,
    duration: 4000,
  });
}

/**
 * Shows an info toast
 */
export function showInfoToast(title: string, description?: string) {
  toast.info(title, {
    description,
    duration: 4000,
  });
}

/**
 * Shows a warning toast
 */
export function showWarningToast(title: string, description?: string) {
  toast.warning(title, {
    description,
    duration: 4000,
  });
}

/**
 * Checks if an error is a specific HTTP status code
 */
export function isHttpError(error: unknown, status: number): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === status;
  }
  return false;
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message === 'Network Error';
  }
  return false;
}

