/**
 * Authentication API service
 * Handles login, logout, refresh, and user verification
 */

import { apiClient, handleApiResponse, handleApiError } from './client';
import { AUTH_ENDPOINTS } from '@/constants/api';
import type { 
  LoginCredentials, 
  LoginResponse, 
  ProfileResponse,
  RefreshResponse, 
  AuthUser 
} from '@/types/auth.types';

export class AuthService {
  /**
   * Login user with username and password
   * Returns token data that needs to be stored for subsequent requests
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Create form data for application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await apiClient.post<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get current authenticated user profile
   * This updates last_login and fetches complete user data
   */
  static async getUserProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<ProfileResponse>(
        AUTH_ENDPOINTS.ME
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        AUTH_ENDPOINTS.LOGOUT
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Refresh authentication token
   */
  static async refresh(): Promise<RefreshResponse> {
    try {
      const response = await apiClient.post<RefreshResponse>(
        AUTH_ENDPOINTS.REFRESH
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Verify current authentication status
   */
  static async verify(): Promise<{ user: AuthUser }> {
    try {
      const response = await apiClient.get<{ user: AuthUser }>(
        AUTH_ENDPOINTS.VERIFY
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get current authenticated user details
   */
  static async me(): Promise<{ user: AuthUser }> {
    try {
      const response = await apiClient.get<{ user: AuthUser }>(
        AUTH_ENDPOINTS.ME
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default AuthService;