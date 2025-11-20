import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PlayIcon, 
  SaveIcon, 
  TrashIcon,
  EyeIcon,
  DocumentIcon,
  ChartBarIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
  FunnelIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Input, Select, Textarea, Badge, Tab } from '../atoms';
import { FormField, DataTable, Modal } from '../molecules';
import { 
  useCreateReport,
  useUpdateReport,
  useDeleteReport,
  useGetDataSources,
  useRunReport,
  usePreviewReport
} from '../../hooks';
import { toast } from '../../services/toast';
import { 
  ReportConfig, 
  ReportType, 
  VisualizationType, 
  DataSource, 
  ReportFilter 
} from '../../types/api.types';

interface AdvancedAnalyticsReportBuilderProps {
  reportId?: string;
  initialConfig?: Partial<ReportConfig>;
  onSave?: (report: ReportConfig) => void;
  onCancel?: () => void;
  className?: string;
}

export const AdvancedAnalyticsReportBuilder: React.FC<AdvancedAnalyticsReportBuilderProps> = ({
  reportId,
  initialConfig,
  onSave,
  onCancel,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'data' | 'visualization' | 'filters' | 'preview'>('basic');
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    name: '',
    description: '',
    type: 'table' as ReportType,
    data_source_ids: [],
    metrics: [],
    dimensions: [],
    filters: [],
    visualization: {
      type: 'table' as VisualizationType,
      config: {}
    },
    schedule: null,
    permissions: {
      public: false,
      shared_with: []
    },
    ...initialConfig
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [reportFilters, setReportFilters] = useState<ReportFilter[]>([]);

  const { data: dataSources, isLoading: loadingDataSources } = useGetDataSources();
  const createReportMutation = useCreateReport();
  const updateReportMutation = useUpdateReport();
  const deleteReportMutation = useDeleteReport();
  const { mutate: runReport, isLoading: runningReport } = useRunReport();
  const { mutate: previewReport, data: previewData, isLoading: previewing } = usePreviewReport();

  const reportTypes = [
    { value: 'table', label: 'Data Table', icon: TableCellsIcon },
    { value: 'chart', label: 'Chart View', icon: ChartBarIcon },
    { value: 'dashboard', label: 'Dashboard', icon: PresentationChartLineIcon },
    { value: 'export', label: 'Export Report', icon: DocumentIcon }
  ];

  const visualizationTypes = [
    { value: 'table', label: 'Table', icon: TableCellsIcon },
    { value: 'bar', label: 'Bar Chart', icon: ChartBarIcon },
    { value: 'line', label: 'Line Chart', icon: PresentationChartLineIcon },
    { value: 'pie', label: 'Pie Chart', icon: ChartBarIcon },
    { value: 'area', label: 'Area Chart', icon: ChartBarIcon },
    { value: 'scatter', label: 'Scatter Plot', icon: ChartBarIcon }
  ];

  const availableMetrics = [
    'user_count',
    'session_count',
    'page_views',
    'unique_visitors',
    'conversion_rate',
    'bounce_rate',
    'avg_session_duration',
    'revenue',
    'orders',
    'cart_abandonment_rate'
  ];

  const availableDimensions = [
    'date',
    'hour',
    'day_of_week',
    'month',
    'quarter',
    'year',
    'user_segment',
    'traffic_source',
    'device_type',
    'browser',
    'country',
    'city',
    'campaign',
    'channel'
  ];

  const handleSaveReport = async () => {
    try {
      const reportData = {
        ...reportConfig,
        metrics: selectedMetrics,
        dimensions: selectedDimensions,
        filters: reportFilters
      } as ReportConfig;

      if (reportId) {
        await updateReportMutation.mutateAsync({ id: reportId, data: reportData });
        toast.success('Report updated successfully');
      } else {
        const newReport = await createReportMutation.mutateAsync(reportData);
        toast.success('Report created successfully');
        onSave?.(newReport);
      }
    } catch (error) {
      toast.error('Failed to save report');
    }
  };

  const handlePreviewReport = () => {
    const reportData = {
      ...reportConfig,
      metrics: selectedMetrics,
      dimensions: selectedDimensions,
      filters: reportFilters
    } as ReportConfig;

    previewReport(reportData);
    setShowPreview(true);
  };

  const handleRunReport = () => {
    if (!reportId) {
      toast.error('Please save the report first');
      return;
    }

    runReport(reportId);
    toast.info('Report execution started');
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      field: '',
      operator: 'equals',
      value: '',
      type: 'string'
    };
    setReportFilters([...reportFilters, newFilter]);
  };

  const updateFilter = (index: number, filter: ReportFilter) => {
    const updatedFilters = [...reportFilters];
    updatedFilters[index] = filter;
    setReportFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    setReportFilters(reportFilters.filter((_, i) => i !== index));
  };

  const tabs = [
    { key: 'basic', label: 'Basic Info', icon: DocumentIcon },
    { key: 'data', label: 'Data Sources', icon: ChartBarIcon },
    { key: 'visualization', label: 'Visualization', icon: PresentationChartLineIcon },
    { key: 'filters', label: 'Filters', icon: FunnelIcon },
    { key: 'preview', label: 'Preview', icon: EyeIcon }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {reportId ? 'Edit Report' : 'Create New Report'}
          </h1>
          <p className="text-gray-600 mt-1">
            Build custom reports with advanced analytics and visualizations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePreviewReport}
            disabled={previewing}
            className="flex items-center gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            {previewing ? 'Previewing...' : 'Preview'}
          </Button>
          
          {reportId && (
            <Button
              variant="outline"
              onClick={handleRunReport}
              disabled={runningReport}
              className="flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              {runningReport ? 'Running...' : 'Run Report'}
            </Button>
          )}
          
          <Button
            onClick={handleSaveReport}
            disabled={createReportMutation.isLoading || updateReportMutation.isLoading}
            className="flex items-center gap-2"
          >
            <SaveIcon className="w-4 h-4" />
            {createReportMutation.isLoading || updateReportMutation.isLoading ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField label="Report Name" required>
                  <Input
                    value={reportConfig.name || ''}
                    onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                    placeholder="Enter report name"
                  />
                </FormField>

                <FormField label="Report Type" required>
                  <Select
                    value={reportConfig.type || ''}
                    onChange={(value) => setReportConfig({ ...reportConfig, type: value as ReportType })}
                    options={reportTypes.map(type => ({ value: type.value, label: type.label }))}
                  />
                </FormField>
              </div>

              <FormField label="Description">
                <Textarea
                  value={reportConfig.description || ''}
                  onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                  placeholder="Enter report description"
                  rows={3}
                />
              </FormField>
            </Card>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
              
              {loadingDataSources ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading data sources...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataSources?.map((source: DataSource) => (
                    <div
                      key={source.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        reportConfig.data_source_ids?.includes(source.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const currentSources = reportConfig.data_source_ids || [];
                        const isSelected = currentSources.includes(source.id);
                        
                        setReportConfig({
                          ...reportConfig,
                          data_source_ids: isSelected
                            ? currentSources.filter(id => id !== source.id)
                            : [...currentSources, source.id]
                        });
                      }}
                    >
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                      <Badge className="mt-2">{source.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Metrics</h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableMetrics.map((metric) => (
                    <label key={metric} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric]);
                          } else {
                            setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm capitalize">{metric.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dimensions</h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableDimensions.map((dimension) => (
                    <label key={dimension} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDimensions.includes(dimension)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDimensions([...selectedDimensions, dimension]);
                          } else {
                            setSelectedDimensions(selectedDimensions.filter(d => d !== dimension));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm capitalize">{dimension.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'visualization' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Visualization Settings</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {visualizationTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = reportConfig.visualization?.type === type.value;
                  
                  return (
                    <button
                      key={type.value}
                      onClick={() => setReportConfig({
                        ...reportConfig,
                        visualization: {
                          ...reportConfig.visualization,
                          type: type.value as VisualizationType
                        }
                      })}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Visualization Configuration */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium mb-4">Configuration Options</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Chart Title">
                    <Input
                      value={reportConfig.visualization?.config?.title || ''}
                      onChange={(e) => setReportConfig({
                        ...reportConfig,
                        visualization: {
                          ...reportConfig.visualization,
                          config: {
                            ...reportConfig.visualization?.config,
                            title: e.target.value
                          }
                        }
                      })}
                      placeholder="Enter chart title"
                    />
                  </FormField>

                  <FormField label="Color Scheme">
                    <Select
                      value={reportConfig.visualization?.config?.colorScheme || 'blue'}
                      onChange={(value) => setReportConfig({
                        ...reportConfig,
                        visualization: {
                          ...reportConfig.visualization,
                          config: {
                            ...reportConfig.visualization?.config,
                            colorScheme: value
                          }
                        }
                      })}
                      options={[
                        { value: 'blue', label: 'Blue' },
                        { value: 'green', label: 'Green' },
                        { value: 'purple', label: 'Purple' },
                        { value: 'orange', label: 'Orange' },
                        { value: 'red', label: 'Red' }
                      ]}
                    />
                  </FormField>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'filters' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Report Filters</h3>
                <Button onClick={addFilter} className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Add Filter
                </Button>
              </div>

              <div className="space-y-4">
                {reportFilters.map((filter, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField label="Field">
                        <Select
                          value={filter.field}
                          onChange={(value) => updateFilter(index, { ...filter, field: value })}
                          options={[...selectedDimensions, ...selectedMetrics].map(field => ({
                            value: field,
                            label: field.replace('_', ' ')
                          }))}
                          placeholder="Select field"
                        />
                      </FormField>

                      <FormField label="Operator">
                        <Select
                          value={filter.operator}
                          onChange={(value) => updateFilter(index, { ...filter, operator: value as any })}
                          options={[
                            { value: 'equals', label: 'Equals' },
                            { value: 'not_equals', label: 'Not Equals' },
                            { value: 'greater_than', label: 'Greater Than' },
                            { value: 'less_than', label: 'Less Than' },
                            { value: 'contains', label: 'Contains' },
                            { value: 'not_contains', label: 'Not Contains' },
                            { value: 'in', label: 'In' },
                            { value: 'not_in', label: 'Not In' }
                          ]}
                        />
                      </FormField>

                      <FormField label="Value">
                        <Input
                          value={filter.value?.toString() || ''}
                          onChange={(e) => updateFilter(index, { ...filter, value: e.target.value })}
                          placeholder="Enter filter value"
                        />
                      </FormField>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() => removeFilter(index)}
                          className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {reportFilters.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FunnelIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No filters configured</p>
                    <p className="text-sm">Click "Add Filter" to create report filters</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Report Preview</h3>
                <Button
                  onClick={handlePreviewReport}
                  disabled={previewing}
                  className="flex items-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  {previewing ? 'Generating Preview...' : 'Refresh Preview'}
                </Button>
              </div>

              {previewing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Generating report preview...</p>
                </div>
              ) : previewData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Report Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Data Sources:</span>
                        <p className="font-medium">{reportConfig.data_source_ids?.length || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Metrics:</span>
                        <p className="font-medium">{selectedMetrics.length}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dimensions:</span>
                        <p className="font-medium">{selectedDimensions.length}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Filters:</span>
                        <p className="font-medium">{reportFilters.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview visualization would be rendered here */}
                  <div className="border border-gray-200 rounded-lg p-6 min-h-[300px] bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Preview visualization</p>
                      <p className="text-sm text-gray-400">Visualization will appear here when data is available</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <EyeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Click "Refresh Preview" to generate report preview</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          Cancel
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePreviewReport}
            disabled={previewing}
          >
            Preview Report
          </Button>
          
          <Button
            onClick={handleSaveReport}
            disabled={createReportMutation.isLoading || updateReportMutation.isLoading}
            className="flex items-center gap-2"
          >
            <SaveIcon className="w-4 h-4" />
            {reportId ? 'Update Report' : 'Create Report'}
          </Button>
        </div>
      </div>
    </div>
  );
};