/**
 * Settings API Hooks
 * TanStack Query hooks for settings and configuration operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '@/services/api';
import { toast } from '@/services/toast';
import type { SystemSettings } from '@/types/api.types';

// Query Keys
export const SETTINGS_QUERY_KEYS = {
  all: ['settings'] as const,
  full: () => [...SETTINGS_QUERY_KEYS.all, 'full'] as const,
  section: (section: string) => [...SETTINGS_QUERY_KEYS.all, 'section', section] as const,
  systemInfo: () => [...SETTINGS_QUERY_KEYS.all, 'systemInfo'] as const,
  maintenanceMode: () => [...SETTINGS_QUERY_KEYS.all, 'maintenance'] as const,
} as const;

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch all system settings
 */
export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.full(),
    queryFn: () => SettingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch specific settings section
 */
export const useSettingsSection = (section: 'general' | 'security' | 'notifications' | 'integrations') => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.section(section),
    queryFn: () => SettingsService.getSettingsSection(section),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch general settings
 */
export const useGeneralSettings = () => {
  return useSettingsSection('general');
};

/**
 * Hook to fetch security settings
 */
export const useSecuritySettings = () => {
  return useSettingsSection('security');
};

/**
 * Hook to fetch notification settings
 */
export const useNotificationSettings = () => {
  return useSettingsSection('notifications');
};

/**
 * Hook to fetch integration settings
 */
export const useIntegrationSettings = () => {
  return useSettingsSection('integrations');
};

/**
 * Hook to fetch system information
 */
export const useSystemInfo = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.systemInfo(),
    queryFn: () => SettingsService.getSystemInfo(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to update system settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<SystemSettings>) => 
      SettingsService.updateSettings(settings),
    onSuccess: (updatedSettings: SystemSettings) => {
      // Update cached settings
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.full(), updatedSettings);

      // Invalidate section queries as they might be affected
      queryClient.invalidateQueries({ 
        queryKey: [...SETTINGS_QUERY_KEYS.all, 'section'] 
      });

      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update settings');
    },
  });
};

/**
 * Hook to update specific settings section
 */
export const useUpdateSettingsSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      section, 
      data 
    }: { 
      section: 'general' | 'security' | 'notifications' | 'integrations';
      data: any;
    }) => SettingsService.updateSettingsSection(section, data),
    onSuccess: (updatedSection, variables) => {
      // Update cached section
      queryClient.setQueryData(
        SETTINGS_QUERY_KEYS.section(variables.section), 
        updatedSection
      );

      // Invalidate full settings to ensure consistency
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.full() });

      toast.success(`${variables.section} settings updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update settings section');
    },
  });
};

/**
 * Hook to reset settings to defaults
 */
export const useResetSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => SettingsService.resetSettings(),
    onSuccess: (defaultSettings: SystemSettings) => {
      // Update all cached settings
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.full(), defaultSettings);

      // Invalidate all section queries
      queryClient.invalidateQueries({ 
        queryKey: [...SETTINGS_QUERY_KEYS.all, 'section'] 
      });

      toast.success('Settings reset to defaults successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to reset settings');
    },
  });
};

/**
 * Hook to toggle maintenance mode
 */
export const useToggleMaintenanceMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => SettingsService.toggleMaintenanceMode(enabled),
    onSuccess: (_, enabled) => {
      // Update maintenance mode cache if we track it separately
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.maintenanceMode(), { enabled });

      // Update general settings section to reflect maintenance mode change
      queryClient.setQueryData(
        SETTINGS_QUERY_KEYS.section('general'),
        (oldData: any) => oldData ? { ...oldData, maintenanceMode: enabled } : oldData
      );

      const action = enabled ? 'enabled' : 'disabled';
      toast.success(`Maintenance mode ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to toggle maintenance mode');
    },
  });
};

/**
 * Hook to test email configuration
 */
export const useTestEmailConfiguration = () => {
  return useMutation({
    mutationFn: () => SettingsService.testEmailConfiguration(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Email configuration test successful');
      } else {
        toast.error(result.message || 'Email configuration test failed');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to test email configuration');
    },
  });
};

/**
 * Hook to test SMS configuration
 */
export const useTestSMSConfiguration = () => {
  return useMutation({
    mutationFn: () => SettingsService.testSMSConfiguration(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('SMS configuration test successful');
      } else {
        toast.error(result.message || 'SMS configuration test failed');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to test SMS configuration');
    },
  });
};

/**
 * Hook to backup settings
 */
export const useBackupSettings = () => {
  return useMutation({
    mutationFn: () => SettingsService.backupSettings(),
    onSuccess: (blob: Blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Settings backup downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to backup settings');
    },
  });
};

/**
 * Hook to restore settings from backup
 */
export const useRestoreSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (backupFile: File) => SettingsService.restoreSettings(backupFile),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all settings data as restore might have changed everything
        queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.all });
        
        toast.success('Settings restored successfully');
      } else {
        toast.error(result.message || 'Failed to restore settings');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to restore settings');
    },
  });
};

// ==================== COMBINED HOOKS ====================

/**
 * Hook that combines all settings data
 */
export const useAllSettings = () => {
  const fullSettingsQuery = useSettings();
  const systemInfoQuery = useSystemInfo();

  const queries = [fullSettingsQuery, systemInfoQuery];

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const errors = queries.filter(query => query.error).map(query => query.error);

  return {
    settings: fullSettingsQuery.data,
    systemInfo: systemInfoQuery.data,
    isLoading,
    isError,
    errors,
    refetch: () => {
      queries.forEach(query => query.refetch());
    },
  };
};

/**
 * Hook to refresh all settings data
 */
export const useRefreshSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all settings-related queries to force refresh
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.all });
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Settings refreshed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to refresh settings');
    },
  });
};

// ==================== OPTIMISTIC UPDATE HELPERS ====================

/**
 * Hook to optimistically update settings while mutation is pending
 */
export const useOptimisticSettingsUpdate = () => {
  const queryClient = useQueryClient();

  const updateSettingsOptimistically = <T>(
    queryKey: readonly unknown[],
    updates: Partial<T>
  ) => {
    queryClient.setQueryData(queryKey, (oldSettings: T | undefined) => 
      oldSettings ? { ...oldSettings, ...updates } : undefined
    );
  };

  return { updateSettingsOptimistically };
};