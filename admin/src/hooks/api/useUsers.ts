/**
 * User API Hooks (Updated for new service architecture)
 * TanStack Query hooks for user-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api';
import { toast } from '@/services/toast';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  QueryParams,
} from '@/types/api.types';

// Query Keys
export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (filters: UserFilters & QueryParams) => [...USER_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
  stats: () => [...USER_QUERY_KEYS.all, 'stats'] as const,
  search: (query: string) => [...USER_QUERY_KEYS.all, 'search', query] as const,
} as const;

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated list of users
 */
export const useUsers = (params: UserFilters & QueryParams = {}) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: async () => {
      const response = await userService.getUsers(params);
      return response.data;
    },
    enabled: true,
  });
};

/**
 * Hook to fetch single user by ID
 */
export const useUser = (id: string, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await userService.getUser(id);
      return response.data;
    },
    enabled: !!id && (options.enabled !== false),
  });
};

/**
 * Hook to fetch user statistics
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await userService.getDashboardStats();
      return response.data;
    },
  });
};

/**
 * Hook to search users
 */
export const useUserSearch = (query: string, searchType: 'name' | 'email' | 'phone' = 'name') => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.search(query),
    queryFn: async () => {
      const response = await userService.searchUsers(query, searchType);
      return response.data;
    },
    enabled: query.length >= 2,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      const response = await userService.createUser(userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    },
  });
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      const response = await userService.updateUser(id, data);
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      queryClient.setQueryData(USER_QUERY_KEYS.detail(id), data);
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    },
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await userService.deleteUser(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    },
  });
};

/**
 * Hook to update user status
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, reason }: { 
      id: string; 
      status: 'active' | 'inactive' | 'suspended';
      reason?: string;
    }) => {
      const response = await userService.updateUserStatus(id, { status, reason });
      return response.data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      queryClient.setQueryData(USER_QUERY_KEYS.detail(id), data);
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update user status');
    },
  });
};

/**
 * Hook for bulk user actions
 */
export const useBulkUserActions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: {
      action: 'activate' | 'suspend' | 'delete';
      user_ids: string[];
      reason?: string;
    }) => {
      const response = await userService.bulkUserActions(action);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      toast.success(`Successfully processed ${result.successful.length} users`);
      if (result.failed.length > 0) {
        toast.error(`Failed to process ${result.failed.length} users`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to process users');
    },
  });
};

/**
 * Hook to export users
 */
export const useExportUsers = () => {
  return useMutation({
    mutationFn: async (filters: UserFilters = {}) => {
      const response = await userService.exportUsers({
        filters,
        format: 'csv',
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.download_url, '_blank');
      toast.success('Export started. Download will begin shortly.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to export users');
    },
  });
};