import { apiService } from './base';
import type {
  FeatureFlag,
  FeatureFlagCreate,
  FeatureFlagUpdate,
  FeatureFlagFilters,
  FeatureFlagListResponse,
  FeatureFlagToggleRequest,
  FeatureFlagToggleResponse,
  PaginationParams,
} from '../../types/api.types';

/**
 * Feature Flags Service
 * Handles feature flag management including CRUD, toggle, and filtering
 */
export class FeatureFlagsService {
  private readonly basePath = '/api/admin/v1/system/feature-flags';

  // ===== CRUD OPERATIONS =====

  /**
   * Create a new feature flag
   */
  async createFeatureFlag(data: FeatureFlagCreate): Promise<FeatureFlag> {
    return apiService.post<FeatureFlag>(this.basePath, data);
  }

  /**
   * Get paginated list of feature flags with filters
   */
  async getFeatureFlags(
    filters?: FeatureFlagFilters,
    pagination?: PaginationParams
  ): Promise<FeatureFlagListResponse> {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      size: pagination?.page_size || 50,
    };
    return apiService.get<FeatureFlagListResponse>(this.basePath, { params });
  }

  /**
   * Get feature flag by ID
   */
  async getFeatureFlag(flagId: string): Promise<FeatureFlag> {
    return apiService.get<FeatureFlag>(`${this.basePath}/${flagId}`);
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(flagId: string, data: FeatureFlagUpdate): Promise<FeatureFlag> {
    return apiService.put<FeatureFlag>(`${this.basePath}/${flagId}`, data);
  }

  /**
   * Delete a feature flag
   */
  async deleteFeatureFlag(flagId: string): Promise<void> {
    return apiService.delete<void>(`${this.basePath}/${flagId}`);
  }

  // ===== TOGGLE OPERATIONS =====

  /**
   * Toggle feature flag (quick enable/disable)
   */
  async toggleFeatureFlag(
    flagId: string,
    data: FeatureFlagToggleRequest
  ): Promise<FeatureFlagToggleResponse> {
    return apiService.post<FeatureFlagToggleResponse>(`${this.basePath}/${flagId}/toggle`, data);
  }

  /**
   * Enable a feature flag
   */
  async enableFeatureFlag(flagId: string): Promise<FeatureFlagToggleResponse> {
    return this.toggleFeatureFlag(flagId, { is_enabled: true });
  }

  /**
   * Disable a feature flag
   */
  async disableFeatureFlag(flagId: string): Promise<FeatureFlagToggleResponse> {
    return this.toggleFeatureFlag(flagId, { is_enabled: false });
  }

  // ===== FILTER HELPERS =====

  /**
   * Get enabled feature flags only
   */
  async getEnabledFlags(pagination?: PaginationParams): Promise<FeatureFlagListResponse> {
    return this.getFeatureFlags({ is_enabled: true }, pagination);
  }

  /**
   * Get disabled feature flags only
   */
  async getDisabledFlags(pagination?: PaginationParams): Promise<FeatureFlagListResponse> {
    return this.getFeatureFlags({ is_enabled: false }, pagination);
  }

  /**
   * Search feature flags by text
   */
  async searchFeatureFlags(
    searchQuery: string,
    pagination?: PaginationParams
  ): Promise<FeatureFlagListResponse> {
    return this.getFeatureFlags({ search: searchQuery }, pagination);
  }

  /**
   * Get flags by user segment
   */
  async getFlagsBySegment(
    segment: string,
    pagination?: PaginationParams
  ): Promise<FeatureFlagListResponse> {
    return this.getFeatureFlags({ user_segment: segment }, pagination);
  }
}

// Export singleton instance
export const featureFlagsService = new FeatureFlagsService();
