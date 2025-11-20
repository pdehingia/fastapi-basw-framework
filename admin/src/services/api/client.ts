/**
 * Axios API client configuration
 * Handles httpOnly cookies, error handling, and request/response interceptors
 * SECURITY: Uses httpOnly cookies only - NO localStorage token storage
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, AUTH_ENDPOINTS } from '@/config/api';

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds
    withCredentials: true, // CRITICAL: Enable httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for security headers
  client.interceptors.request.use(
    (config) => {
      // Add CSRF token if available (from meta tag)
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
      
      // Add correlation ID for request tracking
      config.headers['X-Correlation-ID'] = crypto.randomUUID();
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for auth handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized - but avoid infinite loops
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Don't retry auth endpoints to prevent infinite loops
        if (originalRequest.url?.includes('/auth/login') || 
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/logout')) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Try to refresh the token using httpOnly cookies
          await client.post(AUTH_ENDPOINTS.REFRESH);
          // Retry the original request
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - let the calling code handle the redirect
          console.log('🔗 [API CLIENT] Refresh failed during 401 handling');
          return Promise.reject(refreshError);
        }
      }

      // Handle other HTTP errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = (error.response.data as any)?.message || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
      } else if (error.request) {
        // Request was made but no response received
        return Promise.reject(new Error('Network error. Please check your connection.'));
      } else {
        // Something else happened
        return Promise.reject(new Error('An unexpected error occurred'));
      }
    }
  );

  return client;
};

// Create the main API client
export const apiClient = createApiClient();

// API response wrapper type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Generic API error type
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Helper function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'An unknown error occurred',
  };
};

export default apiClient;
