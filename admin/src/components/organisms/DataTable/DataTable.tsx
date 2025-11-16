/**
 * DataTable Organism Component
 * Reusable data table with sorting, filtering, pagination, and row selection
 */

import React, { useState, useMemo, memo, useCallback } from 'react';
import { EMPTY_STATES, UI_MESSAGES } from '@/constants/messages';
import { shallowEqual } from '@/utils/performance';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  accessor?: (row: T) => any;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sorting?: {
    sortBy?: keyof T | string;
    sortOrder?: 'asc' | 'desc';
    onSort: (column: keyof T | string) => void;
  };
  filtering?: {
    filters: Record<string, string>;
    onFilter: (column: string, value: string) => void;
    onClearFilters: () => void;
  };
  selection?: {
    selectedRows: Set<string | number>;
    onSelectRow: (id: string | number) => void;
    onSelectAll: (selected: boolean) => void;
    getRowId: (row: T) => string | number;
  };
  actions?: {
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    customActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      action: (row: T) => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }>;
  };
  className?: string;
  emptyMessage?: string;
  responsive?: boolean;
}

// Simple spinner component since we don't have it yet
const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
  );
};

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  className = '',
  emptyMessage = EMPTY_STATES.SEARCH.TITLE,
  responsive = true,
}: DataTableProps<T>) => {
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  // Get the display value for a cell - memoized for performance
  const getCellValue = useCallback((row: T, column: DataTableColumn<T>) => {
    if (column.accessor) {
      return column.accessor(row);
    }
    if (typeof column.key === 'string' && column.key.includes('.')) {
      // Handle nested object properties (e.g., 'user.name')
      return column.key.split('.').reduce((obj, key) => obj?.[key], row);
    }
    return row[column.key as keyof T];
  }, []);

  // Handle sorting - memoized to prevent unnecessary re-renders
  const handleSort = useCallback((column: DataTableColumn<T>) => {
    if (!column.sortable || !sorting) return;
    sorting.onSort(column.key);
  }, [sorting]);

  // Handle filtering - memoized for performance
  const handleFilter = useCallback((column: DataTableColumn<T>, value: string) => {
    if (!filtering) {
      setLocalFilters(prev => ({ ...prev, [column.key as string]: value }));
      return;
    }
    filtering.onFilter(column.key as string, value);
  }, [filtering]);

  // Clear all filters - memoized
  const handleClearFilters = useCallback(() => {
    if (filtering) {
      filtering.onClearFilters();
    } else {
      setLocalFilters({});
    }
  }, [filtering]);

  // Filter data locally if no external filtering
  const filteredData = useMemo(() => {
    if (filtering) return data; // External filtering
    
    const filters = localFilters;
    if (Object.keys(filters).length === 0) return data;

    return data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const column = columns.find(col => col.key === key);
        if (!column) return true;
        const cellValue = getCellValue(row, column);
        return String(cellValue).toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [data, localFilters, filtering, columns]);

  // Handle row selection - memoized
  const handleRowSelection = useCallback((row: T) => {
    if (!selection) return;
    const id = selection.getRowId(row);
    selection.onSelectRow(id);
  }, [selection]);

  // Handle select all - memoized
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!selection) return;
    selection.onSelectAll(checked);
  }, [selection]);

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    if (!selection || filteredData.length === 0) return false;
    return filteredData.every(row => 
      selection.selectedRows.has(selection.getRowId(row))
    );
  }, [selection, filteredData]);

  // Check if some rows are selected
  const isSomeSelected = useMemo(() => {
    if (!selection || filteredData.length === 0) return false;
    return filteredData.some(row => 
      selection.selectedRows.has(selection.getRowId(row))
    ) && !isAllSelected;
  }, [selection, filteredData, isAllSelected]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p className="text-lg font-semibold">{UI_MESSAGES.ERROR.GENERIC}</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      {/* Filters and Actions Bar */}
      {(filtering || Object.keys(localFilters).length > 0) && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 flex-wrap">
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <div key={column.key as string} className="min-w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter {column.header}
                    </label>
                    <input
                      type="text"
                      placeholder={`Search ${column.header.toLowerCase()}...`}
                      value={filtering ? filtering.filters[column.key as string] || '' : localFilters[column.key as string] || ''}
                      onChange={(e) => handleFilter(column, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`overflow-x-auto ${responsive ? 'table-responsive' : ''}`}>
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selection && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sorting && (
                      <div className="flex flex-col">
                        <span
                          className={`text-xs ${
                            sorting.sortBy === column.key && sorting.sortOrder === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        >
                          ▲
                        </span>
                        <span
                          className={`text-xs ${
                            sorting.sortBy === column.key && sorting.sortOrder === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => {
                const rowId = selection?.getRowId(row);
                const isSelected = selection?.selectedRows.has(rowId!);

                return (
                  <tr
                    key={rowId || index}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    {selection && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() => handleRowSelection(row)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key as string}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(getCellValue(row, column), row, index)
                          : getCellValue(row, column)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {actions.onView && (
                            <button
                              onClick={() => actions.onView!(row)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              {UI_MESSAGES.ACTIONS.VIEW}
                            </button>
                          )}
                          {actions.onEdit && (
                            <button
                              onClick={() => actions.onEdit!(row)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            >
                              {UI_MESSAGES.ACTIONS.EDIT}
                            </button>
                          )}
                          {actions.onDelete && (
                            <button
                              onClick={() => actions.onDelete!(row)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              {UI_MESSAGES.ACTIONS.DELETE}
                            </button>
                          )}
                          {actions.customActions?.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.action(row)}
                              className={`transition-colors ${
                                action.variant === 'danger'
                                  ? 'text-red-600 hover:text-red-900'
                                  : action.variant === 'secondary'
                                  ? 'text-gray-600 hover:text-gray-900'
                                  : 'text-blue-600 hover:text-blue-900'
                              }`}
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Rows per page:</label>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                      pagination.currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the DataTable component with custom comparison
const MemoizedDataTable = memo(DataTable, <T extends Record<string, any>>(
  prevProps: DataTableProps<T>,
  nextProps: DataTableProps<T>
) => {
  // Custom comparison logic for better performance
  // Don't re-render if only loading state changes for the same data
  if (prevProps.loading !== nextProps.loading && 
      prevProps.data === nextProps.data && 
      prevProps.columns === nextProps.columns) {
    return false; // Allow re-render for loading state changes
  }
  
  // Use shallow comparison for other props
  return shallowEqual(prevProps, nextProps);
}) as <T extends Record<string, any>>(props: DataTableProps<T>) => JSX.Element;

// Add displayName for debugging
(MemoizedDataTable as any).displayName = 'DataTable';

export default MemoizedDataTable;