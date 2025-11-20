/**
 * Enhanced DataTable Component
 * Advanced table with virtualization, filtering, column customization, bulk operations, and export
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  MoreHorizontal,
  CheckSquare,
  Square,
  Minus,
} from 'lucide-react';
import Button from '../../atoms/Button/Button';
import AdvancedFilters, { FilterableColumn } from '../../molecules/AdvancedFilters/AdvancedFilters';
import ColumnCustomization from '../../molecules/ColumnCustomization/ColumnCustomization';
import BulkOperationsToolbar from '../../molecules/BulkOperationsToolbar/BulkOperationsToolbar';
import ExportControls from '../../molecules/ExportControls/ExportControls';
import {
  DataTableFilters,
  DataTablePerformance,
  ColumnManager,
  AdvancedFilter,
  SortConfig,
  TableColumn,
  ColumnCustomization as ColumnConfig,
  BulkOperation,
} from '@/utils/datatable';

export interface EnhancedDataTableProps<T = any> {
  data: T[];
  columns: TableColumn[];
  // Configuration
  height?: number;
  rowHeight?: number;
  enableVirtualization?: boolean;
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnCustomization?: boolean;
  enableBulkOperations?: boolean;
  enableExport?: boolean;
  // Bulk operations
  bulkOperations?: BulkOperation[];
  onBulkOperation?: (operation: BulkOperation, ids: string[]) => Promise<void>;
  // Callbacks
  onRowClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  // Persistence
  tableId?: string;
  // Styling
  className?: string;
  // External filtering (for server-side)
  externalFilters?: AdvancedFilter[];
  onFiltersChange?: (filters: AdvancedFilter[]) => void;
  // Loading state
  isLoading?: boolean;
  loadingMessage?: string;
}

interface TableState {
  selectedIds: Set<string>;
  sortConfig: SortConfig | null;
  filters: AdvancedFilter[];
  quickSearch: string;
  columnConfig: ColumnConfig;
  showAdvancedFilters: boolean;
  showColumnCustomization: boolean;
  showExportControls: boolean;
}

const EnhancedDataTable = <T extends Record<string, any>>({
  data,
  columns,
  height = 400,
  rowHeight = 48,
  enableVirtualization = true,
  enableSelection = true,
  enableSorting = true,
  enableFiltering = true,
  enableColumnCustomization = true,
  enableBulkOperations = true,
  enableExport = true,
  bulkOperations = [],
  onBulkOperation,
  onRowClick,
  onSelectionChange,
  tableId = 'default-table',
  className = '',
  externalFilters,
  onFiltersChange,
  isLoading = false,
  loadingMessage = 'Loading...',
}: EnhancedDataTableProps<T>) => {
  const [state, setState] = useState<TableState>({
    selectedIds: new Set(),
    sortConfig: null,
    filters: externalFilters || [],
    quickSearch: '',
    columnConfig: {
      order: columns.map(col => col.key),
      hiddenColumns: [],
      columnWidths: {},
      pinnedColumns: [],
    },
    showAdvancedFilters: false,
    showColumnCustomization: false,
    showExportControls: false,
  });

  // Refs
  const listRef = useRef<List>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Utilities
  const dataTableFilters = useMemo(() => new DataTableFilters(), []);
  const performance = useMemo(() => new DataTablePerformance(), []);
  const columnManager = useMemo(() => new ColumnManager(tableId), [tableId]);

  // Load saved column configuration
  useEffect(() => {
    const savedConfig = columnManager.loadConfiguration();
    if (savedConfig) {
      setState(prev => ({ ...prev, columnConfig: savedConfig }));
    }
  }, [columnManager]);

  // Get visible columns based on configuration
  const visibleColumns = useMemo(() => {
    const order = state.columnConfig.order || columns.map(col => col.key);
    const hidden = state.columnConfig.hiddenColumns || [];
    
    return order
      .map(key => columns.find(col => col.key === key))
      .filter((col): col is TableColumn => col !== undefined && !hidden.includes(col.key));
  }, [columns, state.columnConfig]);

  // Get pinned and regular columns
  const { pinnedColumns, regularColumns } = useMemo(() => {
    const pinned = state.columnConfig.pinnedColumns || [];
    const pinnedCols = visibleColumns.filter(col => pinned.includes(col.key));
    const regularCols = visibleColumns.filter(col => !pinned.includes(col.key));
    
    return { pinnedColumns: pinnedCols, regularColumns: regularCols };
  }, [visibleColumns, state.columnConfig.pinnedColumns]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    if (!enableFiltering) return data;

    return performance.debounce(() => {
      let filtered = data;

      // Quick search
      if (state.quickSearch) {
        filtered = dataTableFilters.filterBySearch(filtered, state.quickSearch, visibleColumns);
      }

      // Advanced filters
      if (state.filters.length > 0) {
        filtered = dataTableFilters.applyFilters(filtered, state.filters);
      }

      return filtered;
    }, 300)();
  }, [data, state.quickSearch, state.filters, visibleColumns, dataTableFilters, performance, enableFiltering]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!enableSorting || !state.sortConfig) return filteredData;

    return dataTableFilters.sortData(filteredData, state.sortConfig);
  }, [filteredData, state.sortConfig, dataTableFilters, enableSorting]);

  // Virtualized row data with selection state
  const rowData = useMemo(() => {
    return sortedData.map(row => ({
      ...row,
      _isSelected: state.selectedIds.has(row.id || row._id || String(row.key)),
    }));
  }, [sortedData, state.selectedIds]);

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (!enableSorting) return;

    setState(prev => {
      const currentSort = prev.sortConfig;
      let newSort: SortConfig | null;

      if (!currentSort || currentSort.key !== columnKey) {
        newSort = { key: columnKey, direction: 'asc' };
      } else if (currentSort.direction === 'asc') {
        newSort = { key: columnKey, direction: 'desc' };
      } else {
        newSort = null;
      }

      return { ...prev, sortConfig: newSort };
    });
  }, [enableSorting]);

  // Handle selection
  const getRowId = useCallback((row: T) => {
    return row.id || row._id || String(row.key || row.index);
  }, []);

  const handleRowSelection = useCallback((row: T, isSelected: boolean) => {
    if (!enableSelection) return;

    const rowId = getRowId(row);
    setState(prev => {
      const newSelected = new Set(prev.selectedIds);
      
      if (isSelected) {
        newSelected.add(rowId);
      } else {
        newSelected.delete(rowId);
      }

      return { ...prev, selectedIds: newSelected };
    });
  }, [enableSelection, getRowId]);

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (!enableSelection) return;

    setState(prev => {
      const newSelected = isSelected 
        ? new Set(sortedData.map(getRowId))
        : new Set<string>();

      return { ...prev, selectedIds: newSelected };
    });
  }, [enableSelection, sortedData, getRowId]);

  // Handle filters
  const handleFiltersChange = useCallback((filters: AdvancedFilter[]) => {
    setState(prev => ({ ...prev, filters }));
    onFiltersChange?.(filters);
  }, [onFiltersChange]);

  // Handle column configuration
  const handleColumnConfigChange = useCallback((config: ColumnConfig) => {
    setState(prev => ({ ...prev, columnConfig: config }));
    columnManager.saveConfiguration(config);
  }, [columnManager]);

  // Handle bulk operations
  const handleBulkOperation = useCallback(async (operation: BulkOperation, ids: string[]) => {
    if (onBulkOperation) {
      await onBulkOperation(operation, ids);
    }
    setState(prev => ({ ...prev, selectedIds: new Set() }));
  }, [onBulkOperation]);

  // Selection state for checkbox
  const selectionState = useMemo(() => {
    const selectedCount = state.selectedIds.size;
    const totalCount = sortedData.length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === totalCount) return 'all';
    return 'partial';
  }, [state.selectedIds.size, sortedData.length]);

  // Convert columns to filterable format
  const filterableColumns: FilterableColumn[] = useMemo(() => {
    return columns.map(col => ({
      key: col.key,
      header: col.header,
      type: col.filterType || 'text',
      options: col.options,
    }));
  }, [columns]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(Array.from(state.selectedIds));
  }, [state.selectedIds, onSelectionChange]);

  // Row renderer for virtualization
  const renderRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rowData[index];
    const isSelected = row._isSelected;

    return (
      <div
        style={style}
        className={`
          flex items-center border-b border-gray-200 hover:bg-gray-50
          ${isSelected ? 'bg-blue-50' : 'bg-white'}
          ${onRowClick ? 'cursor-pointer' : ''}
        `}
        onClick={() => onRowClick?.(row, index)}
      >
        {/* Selection checkbox */}
        {enableSelection && (
          <div className="w-12 flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleRowSelection(row, e.target.checked);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Pinned columns */}
        {pinnedColumns.map(column => (
          <div
            key={`pinned-${column.key}`}
            className="px-4 py-3 bg-gray-50 border-r border-gray-200"
            style={{ 
              width: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
              minWidth: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
            }}
          >
            {column.render ? column.render(row[column.key], row) : row[column.key]}
          </div>
        ))}

        {/* Regular columns */}
        {regularColumns.map(column => (
          <div
            key={column.key}
            className="px-4 py-3"
            style={{ 
              width: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
              minWidth: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
            }}
          >
            {column.render ? column.render(row[column.key], row) : row[column.key]}
          </div>
        ))}
      </div>
    );
  }, [
    rowData, 
    enableSelection, 
    pinnedColumns, 
    regularColumns, 
    state.columnConfig.columnWidths,
    onRowClick,
    handleRowSelection,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`enhanced-datatable ${className}`}>
      {/* Toolbar */}
      <div className="bg-white border border-gray-300 rounded-t-lg p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Search */}
          <div className="flex items-center gap-4 flex-1">
            {enableFiltering && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={state.quickSearch}
                  onChange={(e) => setState(prev => ({ ...prev, quickSearch: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            )}
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2">
            {enableFiltering && (
              <AdvancedFilters
                columns={filterableColumns}
                filters={state.filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={() => setState(prev => ({ ...prev, showAdvancedFilters: false }))}
                onClearFilters={() => setState(prev => ({ ...prev, filters: [] }))}
                isOpen={state.showAdvancedFilters}
                onToggle={() => setState(prev => ({ 
                  ...prev, 
                  showAdvancedFilters: !prev.showAdvancedFilters 
                }))}
              />
            )}

            {enableColumnCustomization && (
              <ColumnCustomization
                columns={columns}
                columnConfig={state.columnConfig}
                onColumnConfigChange={handleColumnConfigChange}
                isOpen={state.showColumnCustomization}
                onToggle={() => setState(prev => ({ 
                  ...prev, 
                  showColumnCustomization: !prev.showColumnCustomization 
                }))}
                tableId={tableId}
              />
            )}

            {enableExport && (
              <ExportControls
                data={data}
                columns={visibleColumns}
                filteredData={sortedData}
                selectedIds={Array.from(state.selectedIds)}
                filename={`${tableId}-export`}
                isOpen={state.showExportControls}
                onToggle={() => setState(prev => ({ 
                  ...prev, 
                  showExportControls: !prev.showExportControls 
                }))}
              />
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-2 text-sm text-gray-600">
          Showing {sortedData.length.toLocaleString()} of {data.length.toLocaleString()} rows
          {state.selectedIds.size > 0 && (
            <span className="ml-2">• {state.selectedIds.size} selected</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div 
        ref={tableRef}
        className="border-l border-r border-gray-300 bg-white"
        style={{ height: height + 48 }} // Add header height
      >
        {/* Header */}
        <div className="flex items-center bg-gray-50 border-b border-gray-300 sticky top-0 z-10">
          {/* Selection header */}
          {enableSelection && (
            <div className="w-12 flex items-center justify-center py-3">
              <button
                onClick={() => handleSelectAll(selectionState !== 'all')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
                {selectionState === 'all' ? (
                  <CheckSquare className="w-4 h-4" />
                ) : selectionState === 'partial' ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Pinned columns headers */}
          {pinnedColumns.map(column => (
            <div
              key={`pinned-header-${column.key}`}
              className="px-4 py-3 bg-gray-100 border-r border-gray-200"
              style={{ 
                width: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
                minWidth: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
              }}
            >
              {enableSorting && column.sortable !== false ? (
                <button
                  onClick={() => handleSort(column.key)}
                  className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700"
                >
                  {column.header}
                  {state.sortConfig?.key === column.key && (
                    state.sortConfig.direction === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  )}
                </button>
              ) : (
                <span className="font-medium text-gray-900">{column.header}</span>
              )}
            </div>
          ))}

          {/* Regular columns headers */}
          {regularColumns.map(column => (
            <div
              key={`header-${column.key}`}
              className="px-4 py-3"
              style={{ 
                width: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
                minWidth: state.columnConfig.columnWidths?.[column.key] || column.width || 150,
              }}
            >
              {enableSorting && column.sortable !== false ? (
                <button
                  onClick={() => handleSort(column.key)}
                  className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700"
                >
                  {column.header}
                  {state.sortConfig?.key === column.key && (
                    state.sortConfig.direction === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  )}
                </button>
              ) : (
                <span className="font-medium text-gray-900">{column.header}</span>
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No data to display
          </div>
        ) : enableVirtualization ? (
          <List
            ref={listRef}
            height={height}
            itemCount={rowData.length}
            itemSize={rowHeight}
            overscanCount={5}
          >
            {renderRow}
          </List>
        ) : (
          <div style={{ height, overflowY: 'auto' }}>
            {rowData.map((row, index) => (
              <div key={getRowId(row)}>
                {renderRow({ 
                  index, 
                  style: { height: rowHeight } 
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-300 border-t-0 rounded-b-lg px-4 py-2 text-sm text-gray-600">
        Total: {data.length.toLocaleString()} rows
        {filteredData.length !== data.length && (
          <span> (filtered to {filteredData.length.toLocaleString()})</span>
        )}
      </div>

      {/* Bulk Operations */}
      {enableBulkOperations && onBulkOperation && (
        <BulkOperationsToolbar
          selectedIds={Array.from(state.selectedIds)}
          totalCount={sortedData.length}
          operations={bulkOperations}
          onClearSelection={() => setState(prev => ({ ...prev, selectedIds: new Set() }))}
          onExecuteOperation={handleBulkOperation}
          isVisible={state.selectedIds.size > 0}
        />
      )}
    </div>
  );
};

export default EnhancedDataTable;