import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  SaveIcon,
  EyeIcon,
  TrashIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
  NumberedListIcon,
  CalendarDaysIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button, Card, Input, Select, Badge, Tab } from '../atoms';
import { FormField, Modal } from '../molecules';
import {
  useCreateDashboard,
  useUpdateDashboard,
  useGetDashboardWidgets,
  useCreateDashboardWidget,
  useUpdateDashboardWidget,
  useDeleteDashboardWidget,
  useGetReports
} from '../../hooks';
import { toast } from '../../services/toast';
import {
  AnalyticsDashboard,
  DashboardWidget,
  DashboardLayout,
  WidgetType,
  WidgetSize
} from '../../types/api.types';

interface AdvancedAnalyticsDashboardBuilderProps {
  dashboardId?: string;
  initialDashboard?: Partial<AnalyticsDashboard>;
  onSave?: (dashboard: AnalyticsDashboard) => void;
  onCancel?: () => void;
  className?: string;
}

interface WidgetLibraryItem {
  type: WidgetType;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  defaultSize: WidgetSize;
  configurable: boolean;
}

export const AdvancedAnalyticsDashboardBuilder: React.FC<AdvancedAnalyticsDashboardBuilderProps> = ({
  dashboardId,
  initialDashboard,
  onSave,
  onCancel,
  className = ''
}) => {
  const [dashboard, setDashboard] = useState<Partial<AnalyticsDashboard>>({
    name: '',
    description: '',
    layout: {
      columns: 12,
      rows: 'auto',
      gap: 16,
      background: '#ffffff'
    },
    widgets: [],
    permissions: {
      public: false,
      shared_with: []
    },
    refresh_interval: 300,
    ...initialDashboard
  });

  const [widgets, setWidgets] = useState<DashboardWidget[]>(dashboard.widgets || []);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<WidgetLibraryItem | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const { data: reports } = useGetReports({ page: 1, limit: 100 });
  const { data: dashboardWidgets } = useGetDashboardWidgets(dashboardId);
  const createDashboardMutation = useCreateDashboard();
  const updateDashboardMutation = useUpdateDashboard();
  const createWidgetMutation = useCreateDashboardWidget();
  const updateWidgetMutation = useUpdateDashboardWidget();
  const deleteWidgetMutation = useDeleteDashboardWidget();

  const widgetLibrary: WidgetLibraryItem[] = [
    {
      type: 'chart',
      name: 'Chart Widget',
      description: 'Display data in various chart formats',
      icon: ChartBarIcon,
      defaultSize: { width: 6, height: 4 },
      configurable: true
    },
    {
      type: 'table',
      name: 'Data Table',
      description: 'Tabular data display with sorting and filtering',
      icon: TableCellsIcon,
      defaultSize: { width: 8, height: 6 },
      configurable: true
    },
    {
      type: 'metric',
      name: 'Key Metric',
      description: 'Single value display with trends',
      icon: NumberedListIcon,
      defaultSize: { width: 3, height: 2 },
      configurable: true
    },
    {
      type: 'list',
      name: 'List View',
      description: 'List of items with actions',
      icon: ClipboardDocumentListIcon,
      defaultSize: { width: 4, height: 6 },
      configurable: true
    },
    {
      type: 'calendar',
      name: 'Calendar Widget',
      description: 'Calendar view for time-based data',
      icon: CalendarDaysIcon,
      defaultSize: { width: 6, height: 4 },
      configurable: true
    },
    {
      type: 'alert',
      name: 'Alert Widget',
      description: 'Show alerts and notifications',
      icon: BellIcon,
      defaultSize: { width: 4, height: 2 },
      configurable: true
    }
  ];

  const gridSizes = [
    { value: 8, label: '8 Columns' },
    { value: 12, label: '12 Columns' },
    { value: 16, label: '16 Columns' },
    { value: 24, label: '24 Columns' }
  ];

  const refreshIntervals = [
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 0, label: 'Manual only' }
  ];

  const handleSaveDashboard = async () => {
    try {
      const dashboardData = {
        ...dashboard,
        widgets
      } as AnalyticsDashboard;

      if (dashboardId) {
        await updateDashboardMutation.mutateAsync({ id: dashboardId, data: dashboardData });
        toast.success('Dashboard updated successfully');
      } else {
        const newDashboard = await createDashboardMutation.mutateAsync(dashboardData);
        toast.success('Dashboard created successfully');
        onSave?.(newDashboard);
      }
    } catch (error) {
      toast.error('Failed to save dashboard');
    }
  };

  const handleAddWidget = useCallback((widgetType: WidgetLibraryItem, position?: { x: number; y: number }) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType.type,
      title: `New ${widgetType.name}`,
      position: {
        x: position?.x || 0,
        y: position?.y || 0,
        width: widgetType.defaultSize.width,
        height: widgetType.defaultSize.height
      },
      config: {
        data_source: null,
        report_id: null,
        refresh_interval: 300,
        show_legend: true,
        show_title: true
      },
      dashboard_id: dashboardId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
    setShowWidgetConfig(true);
    setShowWidgetLibrary(false);
  }, [widgets, dashboardId]);

  const handleUpdateWidget = (updatedWidget: DashboardWidget) => {
    setWidgets(widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w));
    setSelectedWidget(updatedWidget);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedWidget || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / (dashboard.layout?.columns || 12)));
    const y = Math.floor((e.clientY - rect.top) / 60); // Assuming 60px row height
    
    handleAddWidget(draggedWidget, { x, y });
    setDraggedWidget(null);
  }, [draggedWidget, dashboard.layout?.columns, handleAddWidget]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const renderWidget = (widget: DashboardWidget, isPreview: boolean = false) => {
    const { position } = widget;
    const style = {
      gridColumn: `span ${position.width}`,
      gridRow: `span ${position.height}`,
      minHeight: `${position.height * 60}px`
    };

    return (
      <div
        key={widget.id}
        style={style}
        className={`relative border-2 rounded-lg bg-white shadow-sm transition-all ${
          selectedWidget?.id === widget.id && !isPreview
            ? 'border-blue-500'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => !isPreview && setSelectedWidget(widget)}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <h4 className="font-medium text-sm truncate">{widget.title}</h4>
          {!isPreview && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWidget(widget);
                  setShowWidgetConfig(true);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <Cog6ToothIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWidget(widget.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Widget Content */}
        <div className="p-3 h-full">
          <div className="flex items-center justify-center h-full text-gray-400">
            {(() => {
              const Icon = widgetLibrary.find(w => w.type === widget.type)?.icon || ChartBarIcon;
              return (
                <div className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{widget.type} widget</p>
                  <p className="text-xs text-gray-300">Configure to display data</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {dashboardId ? 'Edit Dashboard' : 'Create Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            Build interactive dashboards with drag-and-drop widgets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>

          <Button
            onClick={handleSaveDashboard}
            disabled={createDashboardMutation.isLoading || updateDashboardMutation.isLoading}
            className="flex items-center gap-2"
          >
            <SaveIcon className="w-4 h-4" />
            {createDashboardMutation.isLoading || updateDashboardMutation.isLoading ? 'Saving...' : 'Save Dashboard'}
          </Button>
        </div>
      </div>

      {!previewMode && (
        <>
          {/* Dashboard Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dashboard Settings</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FormField label="Dashboard Name" required>
                <Input
                  value={dashboard.name || ''}
                  onChange={(e) => setDashboard({ ...dashboard, name: e.target.value })}
                  placeholder="Enter dashboard name"
                />
              </FormField>

              <FormField label="Grid Columns">
                <Select
                  value={dashboard.layout?.columns?.toString() || '12'}
                  onChange={(value) => setDashboard({
                    ...dashboard,
                    layout: { ...dashboard.layout, columns: parseInt(value) }
                  })}
                  options={gridSizes.map(size => ({ value: size.value.toString(), label: size.label }))}
                />
              </FormField>

              <FormField label="Refresh Interval">
                <Select
                  value={dashboard.refresh_interval?.toString() || '300'}
                  onChange={(value) => setDashboard({
                    ...dashboard,
                    refresh_interval: parseInt(value)
                  })}
                  options={refreshIntervals.map(interval => ({ 
                    value: interval.value.toString(), 
                    label: interval.label 
                  }))}
                />
              </FormField>
            </div>
          </Card>

          {/* Widget Library */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Widget Library</h3>
              <Badge>{widgetLibrary.length} Available</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {widgetLibrary.map((widget) => {
                const Icon = widget.icon;
                return (
                  <div
                    key={widget.type}
                    draggable
                    onDragStart={() => setDraggedWidget(widget)}
                    onDragEnd={() => setDraggedWidget(null)}
                    className="p-4 border border-gray-200 rounded-lg cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                    onClick={() => handleAddWidget(widget)}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <h4 className="text-sm font-medium text-center">{widget.name}</h4>
                    <p className="text-xs text-gray-500 text-center mt-1">{widget.defaultSize.width}×{widget.defaultSize.height}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* Dashboard Canvas */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {previewMode ? 'Dashboard Preview' : 'Dashboard Layout'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {widgets.length} widgets
            </span>
            {!previewMode && (
              <Button
                size="sm"
                onClick={() => setShowWidgetLibrary(true)}
                className="flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Widget
              </Button>
            )}
          </div>
        </div>

        <div
          ref={canvasRef}
          className={`min-h-[600px] border-2 border-dashed border-gray-200 rounded-lg p-4 ${
            !previewMode ? 'bg-gray-50' : 'bg-white'
          }`}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${dashboard.layout?.columns || 12}, 1fr)`,
            gap: `${dashboard.layout?.gap || 16}px`
          }}
        >
          {widgets.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="text-center">
                <ArrowsPointingOutIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Your dashboard is empty</p>
                <p className="text-gray-400 text-sm">
                  {previewMode 
                    ? 'Switch to edit mode to add widgets'
                    : 'Drag widgets from the library above or click "Add Widget"'
                  }
                </p>
              </div>
            </div>
          ) : (
            widgets.map(widget => renderWidget(widget, previewMode))
          )}
        </div>
      </Card>

      {/* Widget Configuration Modal */}
      <Modal
        isOpen={showWidgetConfig}
        onClose={() => setShowWidgetConfig(false)}
        title={`Configure ${selectedWidget?.type || 'Widget'}`}
        size="lg"
      >
        {selectedWidget && (
          <div className="space-y-6">
            <FormField label="Widget Title" required>
              <Input
                value={selectedWidget.title}
                onChange={(e) => handleUpdateWidget({ 
                  ...selectedWidget, 
                  title: e.target.value 
                })}
                placeholder="Enter widget title"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Width (columns)">
                <Select
                  value={selectedWidget.position.width.toString()}
                  onChange={(value) => handleUpdateWidget({
                    ...selectedWidget,
                    position: { 
                      ...selectedWidget.position, 
                      width: parseInt(value) 
                    }
                  })}
                  options={Array.from({ length: dashboard.layout?.columns || 12 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} column${i > 0 ? 's' : ''}`
                  }))}
                />
              </FormField>

              <FormField label="Height (rows)">
                <Select
                  value={selectedWidget.position.height.toString()}
                  onChange={(value) => handleUpdateWidget({
                    ...selectedWidget,
                    position: { 
                      ...selectedWidget.position, 
                      height: parseInt(value) 
                    }
                  })}
                  options={Array.from({ length: 10 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} row${i > 0 ? 's' : ''}`
                  }))}
                />
              </FormField>
            </div>

            {selectedWidget.type === 'chart' && (
              <FormField label="Data Source Report">
                <Select
                  value={selectedWidget.config.report_id || ''}
                  onChange={(value) => handleUpdateWidget({
                    ...selectedWidget,
                    config: { 
                      ...selectedWidget.config, 
                      report_id: value 
                    }
                  })}
                  options={reports?.results?.map(report => ({
                    value: report.id,
                    label: report.name
                  })) || []}
                  placeholder="Select a report"
                />
              </FormField>
            )}

            <FormField label="Refresh Interval">
              <Select
                value={selectedWidget.config.refresh_interval?.toString() || '300'}
                onChange={(value) => handleUpdateWidget({
                  ...selectedWidget,
                  config: { 
                    ...selectedWidget.config, 
                    refresh_interval: parseInt(value) 
                  }
                })}
                options={refreshIntervals.map(interval => ({ 
                  value: interval.value.toString(), 
                  label: interval.label 
                }))}
              />
            </FormField>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowWidgetConfig(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowWidgetConfig(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Buttons */}
      {!previewMode && (
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(true)}
            >
              Preview Dashboard
            </Button>

            <Button
              onClick={handleSaveDashboard}
              disabled={createDashboardMutation.isLoading || updateDashboardMutation.isLoading}
            >
              {dashboardId ? 'Update Dashboard' : 'Create Dashboard'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};