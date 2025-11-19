/**
 * Admin Users API Hooks
 * TanStack Query hooks for admin user management operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '../../services/api';
import { toast } from '../../services/toast';
import type {
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  AdminUserFilters,
  QueryParams,
} from '../../types/api.types';

// Query Keys
export const ADMIN_USER_QUERY_KEYS = {
  all: ['admin-users'] as const,
  lists: () => [...ADMIN_USER_QUERY_KEYS.all, 'list'] as const,
  list: (filters: AdminUserFilters & QueryParams) => [...ADMIN_USER_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ADMIN_USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ADMIN_USER_QUERY_KEYS.details(), id] as const,
  activities: () => [...ADMIN_USER_QUERY_KEYS.all, 'activities'] as const,
  activity: (id: string, params: any) => [...ADMIN_USER_QUERY_KEYS.activities(), id, params] as const,
  sessions: () => [...ADMIN_USER_QUERY_KEYS.all, 'sessions'] as const,
  session: (id: string) => [...ADMIN_USER_QUERY_KEYS.sessions(), id] as const,
} as const;

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated list of admin users
 */
export const useAdminUsers = (params: AdminUserFilters & QueryParams = {}) => {
  return useQuery({
    queryKey: ADMIN_USER_QUERY_KEYS.list(params),
    queryFn: async () => {
      const response = await adminUserService.getAdminUsers(params);
      return response.data;
    },
    enabled: true,
  });
};

/**
 * Hook to fetch single admin user by ID
 */
export const useAdminUser = (id: string, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: ADMIN_USER_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await adminUserService.getAdminUser(id);
      return response.data;
    },
    enabled: !!id && (options.enabled !== false),
  });
};

/**
 * Hook to fetch admin user activity logs
 */
export const useAdminActivityLogs = (adminUserId: string, params: QueryParams = {}) => {
  return useQuery({
    queryKey: ADMIN_USER_QUERY_KEYS.activity(adminUserId, params),
    queryFn: async () => {
      const response = await adminUserService.getAdminActivityLogs(adminUserId, params);
      return response.data;
    },
    enabled: !!adminUserId,
  });
};

/**
 * Hook to fetch admin user sessions
 */
export const useAdminUserSessions = (adminUserId: string) => {
  return useQuery({
    queryKey: ADMIN_USER_QUERY_KEYS.session(adminUserId),
    queryFn: async () => {
      const response = await adminUserService.getAdminUserSessions(adminUserId);
      return response.data;
    },
    enabled: !!adminUserId,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new admin user
 */
export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateAdminUserRequest) => {
      const response = await adminUserService.createAdminUser(userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
      toast.success('Admin user created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create admin user');
    },
  });
};

/**
 * Hook to update an existing admin user
 */
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAdminUserRequest }) => {
      const response = await adminUserService.updateAdminUser(id, data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
      queryClient.setQueryData(ADMIN_USER_QUERY_KEYS.detail(id), data);
      toast.success('Admin user updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update admin user');
    },
  });
};

/**
 * Hook to delete an admin user
 */
export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminUserService.deleteAdminUser(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
      toast.success('Admin user deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete admin user');
    },
  });
};

/**
 * Hook to update admin user status
 */
export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, reason }: { 
      id: string; 
      status: 'active' | 'inactive' | 'suspended';
      reason?: string;
    }) => {
      const response = await adminUserService.updateAdminUserStatus(id, { status, reason });
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
      queryClient.setQueryData(ADMIN_USER_QUERY_KEYS.detail(id), data);
      toast.success('Admin user status updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update admin user status');
    },
  });
};

/**
 * Hook to update admin user role
 */
export const useUpdateAdminUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, role }: { 
      id: string; 
      role: 'super_admin' | 'admin' | 'moderator';
    }) => {
      const response = await adminUserService.updateAdminUserRole(id, { role });
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
      queryClient.setQueryData(ADMIN_USER_QUERY_KEYS.detail(id), data);
      toast.success('Admin user role updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update admin user role');
    },
  });
};

/**
 * Hook to terminate admin user sessions
 */
export const useTerminateAdminUserSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adminUserId: string) => {
      const response = await adminUserService.terminateAdminUserSessions(adminUserId);
      return response.data;
    },
    onSuccess: (_, adminUserId) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.session(adminUserId) });
      toast.success('Admin user sessions terminated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to terminate sessions');
    },
  });
};

/**
 * Hook for bulk admin user actions
 */
export const useBulkAdminUserActions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: {
      action: 'activate' | 'deactivate' | 'suspend' | 'delete';
      admin_user_ids: string[];
      reason?: string;
    }) => {
      const response = await adminUserService.bulkAdminUserActions(action);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
      toast.success(`Successfully processed ${result.successful.length} admin users`);
      if (result.failed.length > 0) {
        toast.error(`Failed to process ${result.failed.length} admin users`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to process admin users');
    },
  });
};