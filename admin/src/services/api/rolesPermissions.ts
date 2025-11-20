import { apiService } from './base';
import type {
  Role,
  RoleCreate,
  RoleUpdate,
  RoleFilters,
  RoleListResponse,
  RoleWithPermissions,
  RoleHierarchyNode,
  RoleStatistics,
  PermissionFilters,
  PermissionListResponse,
  PermissionStatistics,
  RolePermissionAssign,
  PaginationParams,
} from '../../types/api.types';

/**
 * Roles and Permissions Service
 * Handles role and permission management including CRUD, hierarchy, and statistics
 */
export class RolesPermissionsService {
  private readonly basePath = '/api/admin/v1/services/roles-permissions';

  // ===== ROLE MANAGEMENT =====

  /**
   * Create a new role
   */
  async createRole(data: RoleCreate): Promise<Role> {
    return apiService.post<Role>(`${this.basePath}/roles`, data);
  }

  /**
   * Get paginated list of roles with filters
   */
  async getRoles(
    filters?: RoleFilters,
    pagination?: PaginationParams
  ): Promise<RoleListResponse> {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      page_size: pagination?.page_size || 20,
    };
    return apiService.get<RoleListResponse>(`${this.basePath}/roles`, { params });
  }

  /**
   * Get role details with permissions
   */
  async getRole(roleId: number): Promise<RoleWithPermissions> {
    return apiService.get<RoleWithPermissions>(`${this.basePath}/roles/${roleId}`);
  }

  /**
   * Update a role
   */
  async updateRole(roleId: number, data: RoleUpdate): Promise<Role> {
    return apiService.put<Role>(`${this.basePath}/roles/${roleId}`, data);
  }

  /**
   * Delete (deactivate) a role
   */
  async deleteRole(roleId: number): Promise<{ role_id: number; deleted: boolean }> {
    return apiService.delete<{ role_id: number; deleted: boolean }>(
      `${this.basePath}/roles/${roleId}`
    );
  }

  /**
   * Get role statistics
   */
  async getRoleStatistics(): Promise<RoleStatistics> {
    return apiService.get<RoleStatistics>(`${this.basePath}/roles/statistics`);
  }

  /**
   * Get role hierarchy tree
   */
  async getRoleHierarchy(): Promise<RoleHierarchyNode[]> {
    return apiService.get<RoleHierarchyNode[]>(`${this.basePath}/roles/hierarchy`);
  }

  // ===== PERMISSION MANAGEMENT =====

  /**
   * Get paginated list of permissions with filters
   */
  async getPermissions(
    filters?: PermissionFilters,
    pagination?: PaginationParams
  ): Promise<PermissionListResponse> {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      page_size: pagination?.page_size || 50,
    };
    return apiService.get<PermissionListResponse>(`${this.basePath}/permissions`, { params });
  }

  /**
   * Get permission statistics
   */
  async getPermissionStatistics(): Promise<PermissionStatistics> {
    return apiService.get<PermissionStatistics>(`${this.basePath}/permissions/statistics`);
  }

  // ===== ROLE-PERMISSION ASSOCIATION =====

  /**
   * Assign permissions to a role
   */
  async assignPermissionsToRole(
    roleId: number,
    data: RolePermissionAssign
  ): Promise<RoleWithPermissions> {
    return apiService.post<RoleWithPermissions>(
      `${this.basePath}/roles/${roleId}/permissions`,
      data
    );
  }

  /**
   * Remove a permission from a role
   */
  async removePermissionFromRole(
    roleId: number,
    permissionId: number
  ): Promise<{ role_id: number; permission_id: number; removed: boolean }> {
    return apiService.delete<{ role_id: number; permission_id: number; removed: boolean }>(
      `${this.basePath}/roles/${roleId}/permissions/${permissionId}`
    );
  }

  // ===== SEARCH & FILTER HELPERS =====

  /**
   * Search roles by text query
   */
  async searchRoles(searchQuery: string, pagination?: PaginationParams): Promise<RoleListResponse> {
    return this.getRoles({ search: searchQuery }, pagination);
  }

  /**
   * Get active roles only
   */
  async getActiveRoles(pagination?: PaginationParams): Promise<RoleListResponse> {
    return this.getRoles({ is_active: true }, pagination);
  }

  /**
   * Get system roles only
   */
  async getSystemRoles(pagination?: PaginationParams): Promise<RoleListResponse> {
    return this.getRoles({ is_system_role: true }, pagination);
  }

  /**
   * Get custom (non-system) roles only
   */
  async getCustomRoles(pagination?: PaginationParams): Promise<RoleListResponse> {
    return this.getRoles({ is_system_role: false }, pagination);
  }

  /**
   * Get roles by hierarchy level
   */
  async getRolesByLevel(level: number, pagination?: PaginationParams): Promise<RoleListResponse> {
    return this.getRoles({ level }, pagination);
  }

  /**
   * Search permissions by text query
   */
  async searchPermissions(
    searchQuery: string,
    pagination?: PaginationParams
  ): Promise<PermissionListResponse> {
    return this.getPermissions({ search: searchQuery }, pagination);
  }

  /**
   * Get permissions by category
   */
  async getPermissionsByCategory(
    category: string,
    pagination?: PaginationParams
  ): Promise<PermissionListResponse> {
    return this.getPermissions({ category }, pagination);
  }

  /**
   * Get active permissions only
   */
  async getActivePermissions(pagination?: PaginationParams): Promise<PermissionListResponse> {
    return this.getPermissions({ is_active: true }, pagination);
  }
}

// Export singleton instance
export const rolesPermissionsService = new RolesPermissionsService();
