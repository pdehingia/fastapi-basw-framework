import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/services/toast';
import analyticsService from '@/services/api/analytics';
import type {
  AnalyticsReport,
  AnalyticsDashboard,
  CreateReportRequest,
  UpdateReportRequest,
  ExecuteReportRequest,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  ReportSearchParams,
  DashboardSearchParams,
  BulkExportRequest,
} from '@/types/api.types';

// ==================== ANALYTICS REPORTS HOOKS ====================

export const useAnalyticsReports = (params?: ReportSearchParams) => {
  return useQuery({
    queryKey: ['analytics-reports', params],
    queryFn: () => analyticsService.reports.getReports(params),
    staleTime: 30000,
  });
};

export const useAnalyticsReport = (id: string) => {
  return useQuery({
    queryKey: ['analytics-reports', id],
    queryFn: () => analyticsService.reports.getReports(),
    enabled: !!id,
  });
};

export const useCreateAnalyticsReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReportRequest) => AnalyticsReportsService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Analytics report created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create analytics report');
    },
  });
};

export const useUpdateAnalyticsReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateReportRequest) => AnalyticsReportsService.updateReport(data),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
      queryClient.setQueryData(['analytics-reports', updatedReport.id], updatedReport);
      toast.success('Analytics report updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update analytics report');
    },
  });
};

export const useDeleteAnalyticsReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => AnalyticsReportsService.deleteReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
      queryClient.removeQueries({ queryKey: ['analytics-reports', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Analytics report deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete analytics report');
    },
  });
};

export const useCloneAnalyticsReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      AnalyticsReportsService.cloneReport(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
      toast.success('Analytics report cloned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to clone analytics report');
    },
  });
};

export const useExecuteAnalyticsReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ExecuteReportRequest) => AnalyticsReportsService.executeReport(request),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['analytics-report-executions', variables.id] 
      });
      if (result.status === 'success') {
        toast.success(`Report executed successfully (${result.metadata.execution_time}ms)`);
      } else {
        toast.error(`Report execution failed: ${result.errors?.join(', ')}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to execute analytics report');
    },
  });
};

export const useReportExecutions = (reportId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['analytics-report-executions', reportId, params],
    queryFn: () => AnalyticsReportsService.getReportExecutions(reportId, params),
    enabled: !!reportId,
    staleTime: 30000,
  });
};

export const useCancelReportExecution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reportId, executionId }: { reportId: string; executionId: string }) =>
      AnalyticsReportsService.cancelExecution(reportId, executionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['analytics-report-executions', variables.reportId] 
      });
      toast.success('Report execution cancelled');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel report execution');
    },
  });
};

export const useScheduleReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      AnalyticsReportsService.scheduleReport(id, active),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
      queryClient.setQueryData(['analytics-reports', updatedReport.id], updatedReport);
      toast.success(`Report schedule ${updatedReport.config.schedule ? 'enabled' : 'disabled'}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update report schedule');
    },
  });
};

export const useReportCategories = () => {
  return useQuery({
    queryKey: ['analytics-report-categories'],
    queryFn: () => AnalyticsReportsService.getReportCategories(),
    staleTime: 300000, // 5 minutes
  });
};

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['analytics-report-templates'],
    queryFn: () => AnalyticsReportsService.getReportTemplates(),
    staleTime: 300000,
  });
};

export const useCreateReportFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, name, config }: { templateId: string; name: string; config?: any }) =>
      AnalyticsReportsService.createFromTemplate(templateId, name, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
      toast.success('Report created from template successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create report from template');
    },
  });
};

export const useValidateReportConfig = () => {
  return useMutation({
    mutationFn: (config: any) => AnalyticsReportsService.validateReportConfig(config),
    onSuccess: (result) => {
      if (result.valid) {
        toast.success('Report configuration is valid');
      } else {
        toast.error(`Configuration errors: ${result.errors.join(', ')}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to validate report configuration');
    },
  });
};

export const useReportSharing = (id: string) => {
  return useQuery({
    queryKey: ['analytics-report-sharing', id],
    queryFn: () => AnalyticsReportsService.getReportSharing(id),
    enabled: !!id,
  });
};

export const useGeneratePublicLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, config }: { 
      id: string; 
      config?: { expires_at?: string; password?: string; allow_download?: boolean; }
    }) => AnalyticsReportsService.generatePublicLink(id, config),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-report-sharing', variables.id] });
      toast.success('Public sharing link generated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to generate public link');
    },
  });
};

export const useRevokePublicLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => AnalyticsReportsService.revokePublicLink(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-report-sharing', id] });
      toast.success('Public sharing link revoked');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to revoke public link');
    },
  });
};

// ==================== ANALYTICS DASHBOARDS HOOKS ====================

export const useAnalyticsDashboards = (params?: DashboardSearchParams) => {
  return useQuery({
    queryKey: ['analytics-dashboards', params],
    queryFn: () => AnalyticsDashboardsService.getDashboards(params),
    staleTime: 30000,
  });
};

export const useAnalyticsDashboard = (id: string) => {
  return useQuery({
    queryKey: ['analytics-dashboards', id],
    queryFn: () => AnalyticsDashboardsService.getDashboard(id),
    enabled: !!id,
  });
};

export const useCreateAnalyticsDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDashboardRequest) => AnalyticsDashboardsService.createDashboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Analytics dashboard created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create analytics dashboard');
    },
  });
};

export const useUpdateAnalyticsDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateDashboardRequest) => AnalyticsDashboardsService.updateDashboard(data),
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
      queryClient.setQueryData(['analytics-dashboards', updatedDashboard.id], updatedDashboard);
      toast.success('Analytics dashboard updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update analytics dashboard');
    },
  });
};

export const useDeleteAnalyticsDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => AnalyticsDashboardsService.deleteDashboard(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
      queryClient.removeQueries({ queryKey: ['analytics-dashboards', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Analytics dashboard deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete analytics dashboard');
    },
  });
};

export const useCloneAnalyticsDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      AnalyticsDashboardsService.cloneDashboard(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
      toast.success('Analytics dashboard cloned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to clone analytics dashboard');
    },
  });
};

export const useSetDefaultDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => AnalyticsDashboardsService.setDefaultDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
      toast.success('Default dashboard updated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to set default dashboard');
    },
  });
};

export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => AnalyticsDashboardsService.refreshDashboard(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
      toast.success(`Dashboard refresh started (${result.widgets_refreshed} widgets)`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to refresh dashboard');
    },
  });
};

export const useDashboardRefreshStatus = (id: string, refreshId: string) => {
  return useQuery({
    queryKey: ['dashboard-refresh-status', id, refreshId],
    queryFn: () => AnalyticsDashboardsService.getDashboardRefreshStatus(id, refreshId),
    enabled: !!id && !!refreshId,
    refetchInterval: 2000, // Poll every 2 seconds
    staleTime: 0,
  });
};

export const useExportDashboard = () => {
  return useMutation({
    mutationFn: ({ 
      id, 
      format, 
      options 
    }: { 
      id: string; 
      format: 'pdf' | 'png' | 'pptx'; 
      options?: any;
    }) => AnalyticsDashboardsService.exportDashboard(id, format, options),
    onSuccess: (result) => {
      if (result.download_url) {
        toast.success('Dashboard exported successfully');
        // Trigger download
        window.open(result.download_url, '_blank');
      } else {
        toast.success('Dashboard export started');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to export dashboard');
    },
  });
};

export const useDashboardThemes = () => {
  return useQuery({
    queryKey: ['analytics-dashboard-themes'],
    queryFn: () => AnalyticsDashboardsService.getDashboardThemes(),
    staleTime: 600000, // 10 minutes
  });
};

export const useDashboardTemplates = () => {
  return useQuery({
    queryKey: ['analytics-dashboard-templates'],
    queryFn: () => AnalyticsDashboardsService.getDashboardTemplates(),
    staleTime: 300000,
  });
};

export const useCreateDashboardFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, name, config }: { templateId: string; name: string; config?: any }) =>
      AnalyticsDashboardsService.createFromTemplate(templateId, name, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
      toast.success('Dashboard created from template successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create dashboard from template');
    },
  });
};

// ==================== DATA SOURCES HOOKS ====================

export const useDataSources = (params?: { type?: string; search?: string }) => {
  return useQuery({
    queryKey: ['analytics-data-sources', params],
    queryFn: () => DataSourcesService.getDataSources(params),
    staleTime: 60000,
  });
};

export const useDataSource = (id: string) => {
  return useQuery({
    queryKey: ['analytics-data-sources', id],
    queryFn: () => DataSourcesService.getDataSource(id),
    enabled: !!id,
  });
};

export const useTestDataSource = () => {
  return useMutation({
    mutationFn: (id: string) => DataSourcesService.testDataSource(id),
    onSuccess: (result) => {
      if (result.status === 'success') {
        toast.success(`Data source test successful (${result.response_time}ms, ${result.row_count} rows)`);
      } else {
        toast.error(`Data source test failed: ${result.message}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to test data source');
    },
  });
};

export const useRefreshDataSourceSchema = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => DataSourcesService.refreshDataSourceSchema(id),
    onSuccess: (updatedDataSource) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-data-sources'] });
      queryClient.setQueryData(['analytics-data-sources', updatedDataSource.id], updatedDataSource);
      toast.success('Data source schema refreshed');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to refresh data source schema');
    },
  });
};

export const usePreviewDataSource = (id: string, params?: { limit?: number; filters?: Record<string, any> }) => {
  return useQuery({
    queryKey: ['analytics-data-source-preview', id, params],
    queryFn: () => DataSourcesService.previewDataSource(id, params),
    enabled: !!id,
    staleTime: 300000,
  });
};

// ==================== EXPORT HOOKS ====================

export const useExportJobs = (params?: { status?: string; format?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['analytics-export-jobs', params],
    queryFn: () => AnalyticsExportService.getExportJobs(params),
    staleTime: 30000,
    refetchInterval: 5000, // Poll for status updates
  });
};

export const useExportJob = (id: string) => {
  return useQuery({
    queryKey: ['analytics-export-jobs', id],
    queryFn: () => AnalyticsExportService.getExportJob(id),
    enabled: !!id,
    refetchInterval: (data) => {
      // Stop polling when job is completed or failed
      return data?.status === 'completed' || data?.status === 'failed' ? false : 2000;
    },
  });
};

export const useCancelExportJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => AnalyticsExportService.cancelExportJob(id),
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-export-jobs'] });
      queryClient.setQueryData(['analytics-export-jobs', updatedJob.id], updatedJob);
      toast.success('Export job cancelled');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel export job');
    },
  });
};

export const useDeleteExportJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => AnalyticsExportService.deleteExportJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-export-jobs'] });
      queryClient.removeQueries({ queryKey: ['analytics-export-jobs', id] });
      toast.success('Export job deleted');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete export job');
    },
  });
};

export const useBulkExport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BulkExportRequest) => AnalyticsExportService.bulkExport(request),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-export-jobs'] });
      toast.success(`Bulk export started (estimated completion: ${result.estimated_completion})`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to start bulk export');
    },
  });
};

export const useDownloadExport = () => {
  return useMutation({
    mutationFn: (id: string) => AnalyticsExportService.downloadExport(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to download export file');
    },
  });
};

// ==================== OVERVIEW HOOKS ====================

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => AnalyticsOverviewService.getOverview(),
    staleTime: 60000,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['analytics-system-metrics'],
    queryFn: () => AnalyticsOverviewService.getSystemMetrics(),
    staleTime: 30000,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useUsageAnalytics = (params?: {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: ['analytics-usage', params],
    queryFn: () => AnalyticsOverviewService.getUsageAnalytics(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useCacheStats = () => {
  return useQuery({
    queryKey: ['analytics-cache-stats'],
    queryFn: () => AnalyticsOverviewService.getCacheStats(),
    staleTime: 60000,
  });
};

export const useClearCache = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (options?: { report_ids?: string[]; older_than?: string }) =>
      AnalyticsOverviewService.clearCache(options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-cache-stats'] });
      toast.success(`Cache cleared: ${result.cleared_entries} entries (${(result.freed_bytes / 1024 / 1024).toFixed(2)} MB freed)`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to clear cache');
    },
  });
};