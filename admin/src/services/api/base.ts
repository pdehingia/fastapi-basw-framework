/**
 * Base API Service with authentication and error handling
 * Provides common functionality for all API services
 */

import { API_BASE_URL, API_CONFIG, HTTP_STATUS } from '@/config/api';
import type { ApiResponse } from '@/types/api.types';

// Base fetch configuration
const BASE_CONFIG: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Always include cookies for Maya's httpOnly cookie auth
};

// API Error class for structured error handling
class ApiResponseError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Request interceptor to add authentication
function addAuthHeaders(config: RequestInit = {}): RequestInit {
  const headers: Record<string, string> = {
    ...BASE_CONFIG.headers as Record<string, string>,
    ...(config.headers as Record<string, string>) || {},
  };

  // Maya uses httpOnly cookies for authentication
  // Just ensure credentials are included for cookie-based auth

  return {
    ...BASE_CONFIG,
    ...config,
    headers,
    credentials: 'include', // Ensure cookies are always sent
  };
}

// Response interceptor for error handling
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  try {
    if (!isJson) {
      throw new ApiResponseError(
        response.status,
        'INVALID_RESPONSE_FORMAT',
        'Expected JSON response from server',
        { contentType }
      );
    }

    const data = await response.json();

    // Handle successful responses
    if (response.ok) {
      // Handle Maya API standardized response format
      if (data.success !== undefined) {
        return data as ApiResponse<T>;
      }
      
      // Handle direct data responses  
      return {
        success: true,
        data: data as T,
        message: 'Request successful',
      } as ApiResponse<T>;
    }

    // Handle error responses
    const errorMessage = data.message || data.error?.message || 'Unknown error occurred';
    const errorCode = data.error?.code || `HTTP_${response.status}`;
    
    throw new ApiResponseError(
      response.status,
      errorCode,
      errorMessage,
      data
    );

  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }

    // Handle JSON parsing errors
    throw new ApiResponseError(
      response.status,
      'RESPONSE_PARSE_ERROR',
      'Failed to parse response from server',
      { originalError: error }
    );
  }
}

// Retry logic for failed requests
async function fetchWithRetry(
  url: string,
  config: RequestInit,
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isAbortError = error instanceof DOMException && error.name === 'AbortError';
      
      if (isLastAttempt || isAbortError) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
    }
  }

  throw new Error('Maximum retry attempts exceeded');
}

// Main API service class
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    const config = addAuthHeaders({ method: 'GET' });

    try {
      const response = await fetchWithRetry(url, config);
      return await handleResponse<T>(response);
    } catch (error) {
      throw this.handleRequestError(error, 'GET', endpoint);
    }
  }

  // POST request
  async post<T>(endpoint: string, body?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = addAuthHeaders({
      method: 'POST',
      body: this.prepareBody(body),
      ...config,
    });

    try {
      const response = await fetchWithRetry(url, requestConfig);
      return await handleResponse<T>(response);
    } catch (error) {
      throw this.handleRequestError(error, 'POST', endpoint);
    }
  }

  // PUT request
  async put<T>(endpoint: string, body?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = addAuthHeaders({
      method: 'PUT',
      body: this.prepareBody(body),
      ...config,
    });

    try {
      const response = await fetchWithRetry(url, requestConfig);
      return await handleResponse<T>(response);
    } catch (error) {
      throw this.handleRequestError(error, 'PUT', endpoint);
    }
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = addAuthHeaders({
      method: 'PATCH',
      body: this.prepareBody(body),
      ...config,
    });

    try {
      const response = await fetchWithRetry(url, requestConfig);
      return await handleResponse<T>(response);
    } catch (error) {
      throw this.handleRequestError(error, 'PATCH', endpoint);
    }
  }

  // DELETE request
  async delete<T>(endpoint: string, config?: RequestInit): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = addAuthHeaders({
      method: 'DELETE',
      ...config,
    });

    try {
      const response = await fetchWithRetry(url, requestConfig);
      return await handleResponse<T>(response);
    } catch (error) {
      throw this.handleRequestError(error, 'DELETE', endpoint);
    }
  }

  // GET request for binary data (files, exports, etc.)
  async getBlob(endpoint: string, params?: Record<string, any>): Promise<Blob> {
    const url = this.buildUrl(endpoint, params);
    const config = addAuthHeaders({ method: 'GET' });

    try {
      const response = await fetchWithRetry(url, config);
      
      if (!response.ok) {
        throw new ApiResponseError(
          response.status,
          'BLOB_REQUEST_FAILED',
          `Failed to fetch blob: ${response.status}`,
          { endpoint, params }
        );
      }

      return await response.blob();
    } catch (error) {
      throw this.handleRequestError(error, 'GET_BLOB', endpoint);
    }
  }

  // Form data POST (for file uploads)
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    // Use credentials for cookie-based authentication
    const headers: Record<string, string> = {};

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include', // Use cookies for authentication
      });
      return await handleResponse<T>(response);
    } catch (error) {
      throw this.handleRequestError(error, 'POST_FORM', endpoint);
    }
  }

  // Build complete URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) { // null or undefined check
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  // Prepare request body
  private prepareBody(body: any): string | FormData | null {
    if (!body) return null;
    if (body instanceof FormData) return body;
    if (typeof body === 'string') return body; // Allow raw strings (e.g., URL-encoded data)
    return JSON.stringify(body);
  }

  // Enhanced error handling
  private handleRequestError(error: any, method: string, endpoint: string): ApiResponseError {
    console.error(`API ${method} ${endpoint} failed:`, error);

    if (error instanceof ApiResponseError) {
      return error;
    }

    // Handle network errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      return new ApiResponseError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        'REQUEST_TIMEOUT',
        'Request timed out. Please try again.',
        { timeout: API_CONFIG.TIMEOUT }
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new ApiResponseError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        'NETWORK_ERROR',
        'Network error. Please check your connection.',
        { originalError: error.message }
      );
    }

    // Handle unknown errors
    return new ApiResponseError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'UNKNOWN_ERROR',
      error.message || 'An unexpected error occurred',
      { originalError: error }
    );
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export specific error types for handling
export { ApiResponseError };

export default apiService;