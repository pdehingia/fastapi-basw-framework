import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Input, Select, Badge, Tab } from '../atoms';
import { DataTable, Modal, FormField } from '../molecules';
import { AdvancedAnalyticsReportBuilder } from './AdvancedAnalyticsReportBuilder';
import { AdvancedAnalyticsDashboardBuilder } from './AdvancedAnalyticsDashboardBuilder';
import {
  useGetReports,
  useGetDashboards,
  useGetExportJobs,
  useDeleteReport,
  useDeleteDashboard,
  useRunReport,
  useCreateExportJob,
  useGetAnalyticsOverview
} from '../../hooks';
import { toast } from '../../services/toast';
import { formatDate, formatDuration } from '../../utils';
import { 
  AnalyticsReport, 
  AnalyticsDashboard, 
  ExportJob, 
  AnalyticsOverview 
} from '../../types/api.types';

interface AdvancedAnalyticsManagementProps {
  className?: string;
}

type ManagementView = 'overview' | 'reports' | 'dashboards' | 'exports';
type ModalState = 
  | { type: 'none' }
  | { type: 'create-report' }
  | { type: 'edit-report'; report: AnalyticsReport }
  | { type: 'create-dashboard' }
  | { type: 'edit-dashboard'; dashboard: AnalyticsDashboard }
  | { type: 'view-report'; report: AnalyticsReport }
  | { type: 'view-dashboard'; dashboard: AnalyticsDashboard };

export const AdvancedAnalyticsManagement: React.FC<AdvancedAnalyticsManagementProps> = ({
  className = ''
}) => {
  const [activeView, setActiveView] = useState<ManagementView>('overview');
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [reportSearch, setReportSearch] = useState('');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [exportSearch, setExportSearch] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Data fetching
  const { data: overview, isLoading: loadingOverview } = useGetAnalyticsOverview();
  const { data: reportsData, isLoading: loadingReports, refetch: refetchReports } = useGetReports({
    page: 1,
    limit: 50,
    search: reportSearch,
    type: selectedReportType === 'all' ? undefined : selectedReportType
  });
  const { data: dashboardsData, isLoading: loadingDashboards, refetch: refetchDashboards } = useGetDashboards({
    page: 1,
    limit: 50,
    search: dashboardSearch
  });
  const { data: exportsData, isLoading: loadingExports } = useGetExportJobs({
    page: 1,
    limit: 50,
    search: exportSearch,
    status: selectedStatus === 'all' ? undefined : selectedStatus
  });

  // Mutations
  const deleteReportMutation = useDeleteReport();
  const deleteDashboardMutation = useDeleteDashboard();
  const { mutate: runReport } = useRunReport();
  const createExportMutation = useCreateExportJob();

  const views = [
    { key: 'overview', label: 'Overview', icon: ChartBarIcon },
    { key: 'reports', label: 'Reports', icon: DocumentIcon },
    { key: 'dashboards', label: 'Dashboards', icon: PresentationChartLineIcon },
    { key: 'exports', label: 'Exports', icon: ArrowDownTrayIcon }
  ];

  const reportTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'table', label: 'Table Reports' },
    { value: 'chart', label: 'Chart Reports' },
    { value: 'dashboard', label: 'Dashboard Reports' },
    { value: 'export', label: 'Export Reports' }
  ];

  const exportStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await deleteReportMutation.mutateAsync(reportId);
      toast.success('Report deleted successfully');
      refetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;
    
    try {
      await deleteDashboardMutation.mutateAsync(dashboardId);
      toast.success('Dashboard deleted successfully');
      refetchDashboards();
    } catch (error) {
      toast.error('Failed to delete dashboard');
    }
  };

  const handleRunReport = (reportId: string) => {
    runReport(reportId);
    toast.info('Report execution started');
  };

  const handleCreateExport = async (reportId: string, format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      await createExportMutation.mutateAsync({
        report_id: reportId,
        format,
        filters: {},
        schedule: null
      });
      toast.success('Export job created successfully');
    } catch (error) {
      toast.error('Failed to create export job');
    }
  };

  const reportColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (report: AnalyticsReport) => (
        <div>
          <p className="font-medium">{report.name}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">{report.description}</p>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (report: AnalyticsReport) => (
        <Badge variant={report.type === 'chart' ? 'blue' : 'gray'}>
          {report.type}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (report: AnalyticsReport) => (
        <Badge variant={report.status === 'active' ? 'green' : 'gray'}>
          {report.status}
        </Badge>
      )
    },
    {
      key: 'last_run',
      label: 'Last Run',
      render: (report: AnalyticsReport) => (
        <div className="text-sm text-gray-600">
          {report.last_run ? formatDate(report.last_run) : 'Never'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (report: AnalyticsReport) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalState({ type: 'view-report', report })}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalState({ type: 'edit-report', report })}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRunReport(report.id)}
          >
            <PlayIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteReport(report.id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const dashboardColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (dashboard: AnalyticsDashboard) => (
        <div>
          <p className="font-medium">{dashboard.name}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">{dashboard.description}</p>
        </div>
      )
    },
    {
      key: 'widgets',
      label: 'Widgets',
      render: (dashboard: AnalyticsDashboard) => (
        <span className="text-sm text-gray-600">
          {dashboard.widgets?.length || 0} widgets
        </span>
      )
    },
    {
      key: 'refresh_interval',
      label: 'Refresh',
      render: (dashboard: AnalyticsDashboard) => (
        <span className="text-sm text-gray-600">
          {dashboard.refresh_interval === 0 
            ? 'Manual' 
            : formatDuration(dashboard.refresh_interval * 1000)
          }
        </span>
      )
    },
    {
      key: 'updated_at',
      label: 'Updated',
      render: (dashboard: AnalyticsDashboard) => (
        <span className="text-sm text-gray-600">
          {formatDate(dashboard.updated_at)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (dashboard: AnalyticsDashboard) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalState({ type: 'view-dashboard', dashboard })}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalState({ type: 'edit-dashboard', dashboard })}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteDashboard(dashboard.id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const exportColumns = [
    {
      key: 'report_name',
      label: 'Report',
      render: (exportJob: ExportJob) => (
        <p className="font-medium">{exportJob.report?.name || 'Unknown Report'}</p>
      )
    },
    {
      key: 'format',
      label: 'Format',
      render: (exportJob: ExportJob) => (
        <Badge>{exportJob.format.toUpperCase()}</Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (exportJob: ExportJob) => {
        const variant = exportJob.status === 'completed' ? 'green' 
          : exportJob.status === 'failed' ? 'red' 
          : exportJob.status === 'running' ? 'blue' 
          : 'gray';
        
        return <Badge variant={variant}>{exportJob.status}</Badge>;
      }
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (exportJob: ExportJob) => (
        <div className="w-24">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${exportJob.progress || 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{exportJob.progress || 0}%</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (exportJob: ExportJob) => (
        <span className="text-sm text-gray-600">
          {formatDate(exportJob.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (exportJob: ExportJob) => (
        <div className="flex items-center gap-2">
          {exportJob.status === 'completed' && exportJob.download_url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(exportJob.download_url, '_blank')}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {loadingOverview ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading analytics overview...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{overview?.total_reports || 0}</p>
                </div>
                <DocumentIcon className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">
                  +{overview?.reports_this_month || 0} this month
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Dashboards</p>
                  <p className="text-3xl font-bold text-gray-900">{overview?.total_dashboards || 0}</p>
                </div>
                <PresentationChartLineIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">
                  +{overview?.dashboards_this_month || 0} this month
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Exports</p>
                  <p className="text-3xl font-bold text-gray-900">{overview?.total_exports || 0}</p>
                </div>
                <ArrowDownTrayIcon className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">
                  +{overview?.exports_this_month || 0} this month
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{overview?.active_reports || 0}</p>
                </div>
                <PlayIcon className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-blue-600">
                  {((overview?.active_reports || 0) / (overview?.total_reports || 1) * 100).toFixed(1)}% active
                </span>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {overview?.recent_activity?.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                  <Badge variant="gray">{activity.type}</Badge>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics and reporting platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setModalState({ type: 'create-dashboard' })}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Dashboard
          </Button>

          <Button
            onClick={() => setModalState({ type: 'create-report' })}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key as ManagementView)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeView === view.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeView === 'overview' && renderOverview()}

        {activeView === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={selectedReportType}
                  onChange={setSelectedReportType}
                  options={reportTypes}
                  className="w-48"
                />

                <Button
                  onClick={() => setModalState({ type: 'create-report' })}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Report
                </Button>
              </div>
            </Card>

            {/* Reports Table */}
            <Card>
              <DataTable
                data={reportsData?.results || []}
                columns={reportColumns}
                loading={loadingReports}
                emptyMessage="No reports found"
              />
            </Card>
          </motion.div>
        )}

        {activeView === 'dashboards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search dashboards..."
                      value={dashboardSearch}
                      onChange={(e) => setDashboardSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setModalState({ type: 'create-dashboard' })}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Dashboard
                </Button>
              </div>
            </Card>

            {/* Dashboards Table */}
            <Card>
              <DataTable
                data={dashboardsData?.results || []}
                columns={dashboardColumns}
                loading={loadingDashboards}
                emptyMessage="No dashboards found"
              />
            </Card>
          </motion.div>
        )}

        {activeView === 'exports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search exports..."
                      value={exportSearch}
                      onChange={(e) => setExportSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={exportStatuses}
                  className="w-48"
                />
              </div>
            </Card>

            {/* Exports Table */}
            <Card>
              <DataTable
                data={exportsData?.results || []}
                columns={exportColumns}
                loading={loadingExports}
                emptyMessage="No export jobs found"
              />
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalState.type === 'create-report'}
        onClose={() => setModalState({ type: 'none' })}
        title="Create New Report"
        size="full"
      >
        <AdvancedAnalyticsReportBuilder
          onSave={() => {
            setModalState({ type: 'none' });
            refetchReports();
          }}
          onCancel={() => setModalState({ type: 'none' })}
        />
      </Modal>

      <Modal
        isOpen={modalState.type === 'edit-report'}
        onClose={() => setModalState({ type: 'none' })}
        title="Edit Report"
        size="full"
      >
        {modalState.type === 'edit-report' && (
          <AdvancedAnalyticsReportBuilder
            reportId={modalState.report.id}
            initialConfig={modalState.report}
            onSave={() => {
              setModalState({ type: 'none' });
              refetchReports();
            }}
            onCancel={() => setModalState({ type: 'none' })}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalState.type === 'create-dashboard'}
        onClose={() => setModalState({ type: 'none' })}
        title="Create New Dashboard"
        size="full"
      >
        <AdvancedAnalyticsDashboardBuilder
          onSave={() => {
            setModalState({ type: 'none' });
            refetchDashboards();
          }}
          onCancel={() => setModalState({ type: 'none' })}
        />
      </Modal>

      <Modal
        isOpen={modalState.type === 'edit-dashboard'}
        onClose={() => setModalState({ type: 'none' })}
        title="Edit Dashboard"
        size="full"
      >
        {modalState.type === 'edit-dashboard' && (
          <AdvancedAnalyticsDashboardBuilder
            dashboardId={modalState.dashboard.id}
            initialDashboard={modalState.dashboard}
            onSave={() => {
              setModalState({ type: 'none' });
              refetchDashboards();
            }}
            onCancel={() => setModalState({ type: 'none' })}
          />
        )}
      </Modal>
    </div>
  );
};