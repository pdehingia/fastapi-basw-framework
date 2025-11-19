/**
 * ExportControls Component
 * Export functionality with format selection and progress tracking
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Download, FileText, File, Database, X, Settings } from 'lucide-react';
import Button from '../../atoms/Button/Button';
import { 
  DataTableExporter, 
  ExportFormat, 
  ExportOptions,
  ExportProgress,
  TableColumn 
} from '@/utils/datatable';

export interface ExportControlsProps {
  data: any[];
  columns: TableColumn[];
  filteredData?: any[];
  selectedIds?: string[];
  filename?: string;
  isOpen: boolean;
  onToggle: () => void;
}

interface ExportState {
  format: ExportFormat;
  options: ExportOptions;
  progress: ExportProgress | null;
  isExporting: boolean;
}

const FORMAT_INFO = {
  csv: {
    icon: <FileText className="w-4 h-4" />,
    label: 'CSV',
    description: 'Comma-separated values file',
    extension: 'csv',
  },
  excel: {
    icon: <File className="w-4 h-4" />,
    label: 'Excel',
    description: 'Microsoft Excel workbook',
    extension: 'xlsx',
  },
  json: {
    icon: <Database className="w-4 h-4" />,
    label: 'JSON',
    description: 'JavaScript Object Notation',
    extension: 'json',
  },
};

const ExportControls: React.FC<ExportControlsProps> = ({
  data,
  columns,
  filteredData,
  selectedIds,
  filename = 'export',
  isOpen,
  onToggle,
}) => {
  const [exportState, setExportState] = useState<ExportState>({
    format: 'csv',
    options: {
      includeHeaders: true,
      selectedRowsOnly: false,
      selectedColumnsOnly: false,
      dateFormat: 'iso',
    },
    progress: null,
    isExporting: false,
  });

  const exporter = useMemo(() => new DataTableExporter(), []);

  // Get export data based on options
  const exportData = useMemo(() => {
    let baseData = filteredData || data;
    
    // Use selected rows only if option is enabled and we have selections
    if (exportState.options.selectedRowsOnly && selectedIds && selectedIds.length > 0) {
      baseData = baseData.filter(row => 
        selectedIds.includes(row.id || row._id || String(row.key))
      );
    }
    
    return baseData;
  }, [data, filteredData, selectedIds, exportState.options.selectedRowsOnly]);

  // Get export columns based on options
  const exportColumns = useMemo(() => {
    let cols = columns;
    
    // Filter out hidden columns if needed
    if (exportState.options.selectedColumnsOnly) {
      // You might want to pass visible columns from parent component
      // For now, we'll export all columns
    }
    
    return cols;
  }, [columns, exportState.options.selectedColumnsOnly]);

  // Update export format
  const updateFormat = useCallback((format: ExportFormat) => {
    setExportState(prev => ({ ...prev, format }));
  }, []);

  // Update export options
  const updateOptions = useCallback((updates: Partial<ExportOptions>) => {
    setExportState(prev => ({
      ...prev,
      options: { ...prev.options, ...updates },
    }));
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setExportState(prev => ({ ...prev, isExporting: true, progress: null }));

      // Create progress callback
      const onProgress = (progress: ExportProgress) => {
        setExportState(prev => ({ ...prev, progress }));
      };

      // Perform export
      await exporter.exportData(
        exportData,
        exportColumns,
        exportState.format,
        {
          ...exportState.options,
          filename,
          onProgress,
        }
      );

      // Success
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        progress: {
          phase: 'complete',
          processed: exportData.length,
          total: exportData.length,
          message: 'Export completed successfully',
        },
      }));

      // Auto-close after success
      setTimeout(() => {
        onToggle();
        setExportState(prev => ({ ...prev, progress: null }));
      }, 2000);

    } catch (error) {
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        progress: {
          phase: 'error',
          processed: 0,
          total: exportData.length,
          message: error instanceof Error ? error.message : 'Export failed',
        },
      }));
    }
  }, [
    exporter,
    exportData,
    exportColumns,
    exportState.format,
    exportState.options,
    filename,
    onToggle,
  ]);

  // Calculate export stats
  const exportStats = useMemo(() => {
    return {
      totalRows: exportData.length,
      totalColumns: exportColumns.length,
      estimatedSize: exportData.length * exportColumns.length * 10, // rough estimate in bytes
    };
  }, [exportData, exportColumns]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        leftIcon={<Download className="w-4 h-4" />}
      >
        Export
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              ariaLabel="Close export dialog"
              disabled={exportState.isExporting}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Export Format
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(FORMAT_INFO) as ExportFormat[]).map(format => (
                <button
                  key={format}
                  onClick={() => updateFormat(format)}
                  disabled={exportState.isExporting}
                  className={`
                    p-3 border rounded-lg text-left transition-all
                    ${exportState.format === format
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${exportState.isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {FORMAT_INFO[format].icon}
                    <span className="font-medium">
                      {FORMAT_INFO[format].label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {FORMAT_INFO[format].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Export Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportState.options.includeHeaders}
                  onChange={(e) => updateOptions({ includeHeaders: e.target.checked })}
                  disabled={exportState.isExporting}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include column headers</span>
              </label>

              {selectedIds && selectedIds.length > 0 && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportState.options.selectedRowsOnly}
                    onChange={(e) => updateOptions({ selectedRowsOnly: e.target.checked })}
                    disabled={exportState.isExporting}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Export selected rows only ({selectedIds.length} selected)
                  </span>
                </label>
              )}

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Date format:</label>
                <select
                  value={exportState.options.dateFormat}
                  onChange={(e) => updateOptions({ 
                    dateFormat: e.target.value as 'iso' | 'locale' | 'short'
                  })}
                  disabled={exportState.isExporting}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="iso">ISO (2023-12-01)</option>
                  <option value="locale">Locale (12/1/2023)</option>
                  <option value="short">Short (Dec 1, 2023)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Export Summary
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Rows: {exportStats.totalRows.toLocaleString()}</div>
              <div>Columns: {exportStats.totalColumns}</div>
              <div>
                Estimated size: {(exportStats.estimatedSize / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          {/* Progress */}
          {exportState.progress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${
                  exportState.progress.phase === 'error' 
                    ? 'bg-red-500' 
                    : exportState.progress.phase === 'complete'
                    ? 'bg-green-500'
                    : 'bg-blue-500 animate-pulse'
                }`} />
                <span className="text-sm font-medium text-gray-900">
                  {exportState.progress.phase === 'preparing' && 'Preparing export...'}
                  {exportState.progress.phase === 'processing' && 'Processing data...'}
                  {exportState.progress.phase === 'generating' && 'Generating file...'}
                  {exportState.progress.phase === 'complete' && 'Export complete!'}
                  {exportState.progress.phase === 'error' && 'Export failed'}
                </span>
              </div>
              
              {exportState.progress.phase !== 'error' && exportState.progress.phase !== 'complete' && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(exportState.progress.processed / exportState.progress.total) * 100}%`
                    }}
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-600 mt-1">
                {exportState.progress.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onToggle}
              disabled={exportState.isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={exportState.isExporting || exportData.length === 0}
              leftIcon={<Download className="w-4 h-4" />}
            >
              {exportState.isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;