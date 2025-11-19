import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon, AdjustmentsHorizontalIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '../../atoms';

export interface TablePagination {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T) => any);
  sortable?: boolean;
  hidden?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  className?: string;
  emptyMessage?: string;
  sortable?: boolean;
  showColumnControls?: boolean;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: string | ((row: T, index: number) => string);
  headerClassName?: string;
  bodyClassName?: string;
  pagination?: TablePagination;
}

type SortOrder = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  order: SortOrder;
}

export const Table = <T extends Record<string, any>>({
  data,
  columns: initialColumns,
  loading = false,
  className = '',
  emptyMessage = 'No data available',
  sortable = true,
  showColumnControls = true,
  onRowClick,
  rowClassName = '',
  headerClassName = '',
  bodyClassName = '',
  pagination,
}: TableProps<T>) => {
  const [sortState, setSortState] = useState<SortState>({ column: null, order: null });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    initialColumns.reduce((acc, col) => ({ ...acc, [col.key]: !col.hidden }), {})
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Get visible columns
  const visibleColumns = useMemo(
    () => initialColumns.filter(col => columnVisibility[col.key]),
    [initialColumns, columnVisibility]
  );

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortable || !sortState.column || !sortState.order) {
      return data;
    }

    const column = initialColumns.find(col => col.key === sortState.column);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let aVal: any, bVal: any;

      if (column.accessor) {
        if (typeof column.accessor === 'function') {
          aVal = column.accessor(a);
          bVal = column.accessor(b);
        } else {
          aVal = a[column.accessor];
          bVal = b[column.accessor];
        }
      } else {
        aVal = a[column.key];
        bVal = b[column.key];
      }

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Convert to string for comparison if needed
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortState.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortState.order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortState, initialColumns, sortable]);

  const handleSort = (columnKey: string) => {
    const column = initialColumns.find(col => col.key === columnKey);
    if (!sortable || !column?.sortable) return;

    setSortState(prev => {
      if (prev.column === columnKey) {
        if (prev.order === 'asc') return { column: columnKey, order: 'desc' };
        if (prev.order === 'desc') return { column: null, order: null };
      }
      return { column: columnKey, order: 'asc' };
    });
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const getSortIcon = (columnKey: string) => {
    if (sortState.column !== columnKey) return null;
    return sortState.order === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const getCellValue = (row: T, column: TableColumn<T>, index: number) => {
    let value: any;

    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        value = column.accessor(row);
      } else {
        value = row[column.accessor];
      }
    } else {
      value = row[column.key];
    }

    if (column.render) {
      return column.render(value, row, index);
    }

    return value;
  };

  const getRowClassName = (row: T, index: number) => {
    const baseClassName = "hover:bg-gray-50 transition-colors duration-150";
    const clickableClassName = onRowClick ? "cursor-pointer" : "";
    
    if (typeof rowClassName === 'function') {
      return `${baseClassName} ${clickableClassName} ${rowClassName(row, index)}`.trim();
    }
    
    return `${baseClassName} ${clickableClassName} ${rowClassName}`.trim();
  };

  if (loading) {
    return (
      <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`}>
      {/* Column Controls */}
      {showColumnControls && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-end">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="text-sm"
            >
              Columns
            </Button>
            
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-2">
                  <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
                    Show/Hide Columns
                  </div>
                  {initialColumns.map(column => (
                    <button
                      key={column.key}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => toggleColumnVisibility(column.key)}
                    >
                      <span>{column.header}</span>
                      {columnVisibility[column.key] ? (
                        <EyeIcon className="w-4 h-4 text-blue-600" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`bg-gray-50 ${headerClassName}`}>
            <tr>
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.headerClassName || ''}`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.header}</span>
                    {sortable && column.sortable && (
                      <div className="ml-2 flex items-center">
                        {getSortIcon(column.key) || (
                          <div className="w-4 h-4 opacity-30">
                            <ChevronUpIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
            {sortedData.map((row, index) => (
              <tr
                key={index}
                className={getRowClassName(row, index)}
                onClick={() => onRowClick?.(row, index)}
              >
                {visibleColumns.map(column => (
                  <td
                    key={`${index}-${column.key}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {getCellValue(row, column, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.ceil(pagination.totalItems / pagination.pageSize) }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === Math.ceil(pagination.totalItems / pagination.pageSize) ||
                    (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                      <Button
                        variant={page === pagination.currentPage ? "primary" : "outline"}
                        size="sm"
                        onClick={() => pagination.onPageChange(page)}
                        className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))
                }
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.pageSize)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;