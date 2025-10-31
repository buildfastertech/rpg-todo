import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and retries
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
        
        // Handle 401 Unauthorized - but only for actual auth failures, not password validation
        if (error.response?.status === 401) {
          // Don't auto-logout for password change errors (wrong current password)
          const isPasswordChangeError = config?.url?.includes('/users/password');
          
          if (!isPasswordChangeError) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }

        // Check if we should retry
        const shouldRetry =
          config &&
          (!config._retryCount || config._retryCount < MAX_RETRIES) &&
          (error.response?.status && RETRYABLE_STATUS_CODES.includes(error.response.status) ||
           error.code === 'ECONNABORTED' ||
           error.message === 'Network Error');

        if (shouldRetry) {
          config._retryCount = (config._retryCount || 0) + 1;
          
          // Calculate exponential backoff delay
          const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1);
          
          console.log(`Retrying request (attempt ${config._retryCount}/${MAX_RETRIES}) after ${delay}ms...`);
          
          await new Promise((resolve) => setTimeout(resolve, delay));
          
          return this.client.request(config);
        }

        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();

