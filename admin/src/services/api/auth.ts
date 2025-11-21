/**
 * Authentication API Service
 * Handles login, logout, profile, and token management
 */

import { AUTH_ENDPOINTS } from '@/config/api';
import { apiService } from './base';
import type { 
  
  LoginRequest, 
  LoginResponse, 
  AdminProfile 
} from '@/types/api.types';

export class AuthService {
  /**
   * Admin login with credentials
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔑 [AUTH] Login request starting...', { username: credentials.username });
    
    // Maya API expects x-www-form-urlencoded for login
    const formBody = new URLSearchParams();
    formBody.append('username', credentials.username);
    formBody.append('password', credentials.password);

    console.log('🔑 [AUTH] Form body prepared:', formBody.toString());
    
    const data = await apiService.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      formBody.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );
    
    console.log('🔑 [AUTH] Login response received:', {
      hasData: !!data
    });
    
    return data;
  }

  /**
   * Get current admin user profile
   */
  async getProfile(): Promise<AdminProfile> {
    console.log('👤 [AUTH] Getting profile...');
    const data = await apiService.get<AdminProfile>(AUTH_ENDPOINTS.ME);
    console.log('👤 [AUTH] Profile response received');
    return data;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<LoginResponse> {
    return await apiService.post<LoginResponse>(AUTH_ENDPOINTS.REFRESH);
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<void> {
    return await apiService.post<void>(AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<{ valid: boolean }> {
    return await apiService.get<{ valid: boolean }>(AUTH_ENDPOINTS.VERIFY);
  }
}

export const authService = new AuthService();
