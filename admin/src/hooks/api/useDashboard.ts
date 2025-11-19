/**
 * Dashboard API Hooks
 * TanStack Query hooks for dashboard analytics and metrics
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardService } from '@/services/api';
import { toast } from '@/services/toast';

// Query Keys
export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  stats: (dateRange?: { startDate: string; endDate: string }) => [...DASHBOARD_QUERY_KEYS.all, 'stats', dateRange] as const,
  userAnalytics: (period: 'day' | 'week' | 'month' | 'year') => [...DASHBOARD_QUERY_KEYS.all, 'users', period] as const,
  bookingAnalytics: (period: 'day' | 'week' | 'month' | 'year') => [...DASHBOARD_QUERY_KEYS.all, 'bookings', period] as const,
  paymentAnalytics: (period: 'day' | 'week' | 'month' | 'year') => [...DASHBOARD_QUERY_KEYS.all, 'payments', period] as const,
  activity: (limit: number) => [...DASHBOARD_QUERY_KEYS.all, 'activity', limit] as const,
  health: () => [...DASHBOARD_QUERY_KEYS.all, 'health'] as const,
  topServices: (period: 'day' | 'week' | 'month' | 'year', limit: number) => [...DASHBOARD_QUERY_KEYS.all, 'services', period, limit] as const,
  kpis: (period: 'day' | 'week' | 'month' | 'year') => [...DASHBOARD_QUERY_KEYS.all, 'kpis', period] as const,
} as const;

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch comprehensive dashboard statistics
 */
export const useDashboardStats = (dateRange?: { startDate: string; endDate: string }) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats(dateRange),
    queryFn: () => DashboardService.getDashboardStats(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

/**
 * Hook to fetch user analytics data
 */
export const useUserAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.userAnalytics(period),
    queryFn: () => DashboardService.getUserAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

/**
 * Hook to fetch booking analytics data
 */
export const useBookingAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.bookingAnalytics(period),
    queryFn: () => DashboardService.getBookingAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

/**
 * Hook to fetch payment analytics data
 */
export const usePaymentAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.paymentAnalytics(period),
    queryFn: () => DashboardService.getPaymentAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

/**
 * Hook to fetch recent activity
 */
export const useRecentActivity = (limit: number = 20) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.activity(limit),
    queryFn: () => DashboardService.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook to fetch platform health status
 */
export const usePlatformHealth = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.health(),
    queryFn: () => DashboardService.getPlatformHealth(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch top performing services
 */
export const useTopServices = (period: 'day' | 'week' | 'month' | 'year' = 'month', limit: number = 10) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.topServices(period, limit),
    queryFn: () => DashboardService.getTopServices(period, limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

/**
 * Hook to fetch KPIs
 */
export const useKPIs = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.kpis(period),
    queryFn: () => DashboardService.getKPIs(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 20 * 60 * 1000, // Refetch every 20 minutes
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to refresh all dashboard data
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all dashboard-related queries to force refresh
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Dashboard data refreshed');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to refresh dashboard');
    },
  });
};

/**
 * Hook to export dashboard data
 */
export const useExportDashboard = () => {
  return useMutation({
    mutationFn: ({ 
      type, 
      dateRange 
    }: { 
      type: 'users' | 'bookings' | 'payments' | 'all';
      dateRange?: { startDate: string; endDate: string };
    }) => DashboardService.exportDashboardData(type, dateRange),
    onSuccess: (blob: Blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${variables.type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Dashboard data exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to export dashboard data');
    },
  });
};

// ==================== COMBINED HOOKS ====================

/**
 * Hook that combines essential dashboard data for overview
 */
export const useDashboardOverview = (options: { 
  period?: 'day' | 'week' | 'month' | 'year';
  dateRange?: { startDate: string; endDate: string };
  activityLimit?: number;
  servicesLimit?: number;
} = {}) => {
  const { period = 'month', dateRange, activityLimit = 10, servicesLimit = 5 } = options;

  const statsQuery = useDashboardStats(dateRange);
  const userAnalyticsQuery = useUserAnalytics(period);
  const bookingAnalyticsQuery = useBookingAnalytics(period);
  const paymentAnalyticsQuery = usePaymentAnalytics(period);
  const activityQuery = useRecentActivity(activityLimit);
  const topServicesQuery = useTopServices(period, servicesLimit);
  const healthQuery = usePlatformHealth();
  const kpisQuery = useKPIs(period);

  const queries = [
    statsQuery, 
    userAnalyticsQuery, 
    bookingAnalyticsQuery, 
    paymentAnalyticsQuery,
    activityQuery,
    topServicesQuery,
    healthQuery,
    kpisQuery
  ];

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const errors = queries.filter(query => query.error).map(query => query.error);

  return {
    stats: statsQuery.data,
    userAnalytics: userAnalyticsQuery.data,
    bookingAnalytics: bookingAnalyticsQuery.data,
    paymentAnalytics: paymentAnalyticsQuery.data,
    activity: activityQuery.data,
    topServices: topServicesQuery.data,
    health: healthQuery.data,
    kpis: kpisQuery.data,
    isLoading,
    isError,
    errors,
    refetch: () => {
      queries.forEach(query => query.refetch());
    },
  };
};

/**
 * Hook for real-time dashboard monitoring
 */
export const useDashboardMonitoring = () => {
  const [alertCount, setAlertCount] = React.useState(0);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  // Use real-time stats with frequent updates
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'realtime'],
    queryFn: () => DashboardService.getDashboardStats(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 0, // Always fetch fresh
  });

  const healthQuery = usePlatformHealth();

  // Monitor for significant changes
  React.useEffect(() => {
    if (statsQuery.data || healthQuery.data) {
      const now = new Date();
      if (lastUpdate) {
        // Check for alerts or significant changes
        const timeDiff = now.getTime() - lastUpdate.getTime();
        if (timeDiff > 60000) { // 1 minute
          let newAlerts = 0;

          // Check dashboard stats for significant changes
          if (statsQuery.data) {
            const stats = statsQuery.data;
            if (stats.total_users < 0 && 
                Math.abs(stats.total_users) > 10) {
              newAlerts++;
            }

            if (stats.total_customers < 0 && 
                Math.abs(stats.total_customers) > 20) {
              newAlerts++;
            }
          }

          // Check health status
          if (healthQuery.data) {
            const health = healthQuery.data;
            if (health.apiStatus !== 'healthy' || health.databaseStatus !== 'healthy') {
              newAlerts++;
            }
          }

          setAlertCount(newAlerts);
        }
      }
      setLastUpdate(now);
    }
  }, [statsQuery.data, healthQuery.data, lastUpdate]);

  return {
    stats: statsQuery.data,
    health: healthQuery.data,
    isLoading: statsQuery.isLoading || healthQuery.isLoading,
    isError: statsQuery.isError || healthQuery.isError,
    errors: [statsQuery.error, healthQuery.error].filter(Boolean),
    alertCount,
    lastUpdate,
    refetch: () => {
      statsQuery.refetch();
      healthQuery.refetch();
    },
  };
};

/**
 * Hook to get dashboard loading state across multiple queries
 */
export const useDashboardLoadingState = () => {
  const queryClient = useQueryClient();
  
  const [isAnyLoading, setIsAnyLoading] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey[0] === 'dashboard') {
        const dashboardQueries = queryClient.getQueryCache().findAll({
          queryKey: DASHBOARD_QUERY_KEYS.all,
        });
        
        const hasLoadingQuery = dashboardQueries.some(query => query.state.fetchStatus === 'fetching');
        setIsAnyLoading(hasLoadingQuery);
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return isAnyLoading;
};