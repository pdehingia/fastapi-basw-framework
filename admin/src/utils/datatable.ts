/**
 * DataTable Utilities
 * Advanced filtering, export, and virtualization utilities
 */

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { TableColumn } from '@/types';

// Re-export TableColumn for convenience
export type { TableColumn };

export type FilterType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'boolean' 
  | 'range';

export type ExportFormat = 'csv' | 'xlsx' | 'json';

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'exporting' | 'complete' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

export type FilterOperator = 
  | 'equals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'between' 
  | 'in' 
  | 'notIn';

export interface AdvancedFilter {
  column: string;
  operator: FilterOperator;
  value: any;
  type: FilterType;
}

export interface ColumnCustomization {
  columnOrder: string[];
  hiddenColumns: string[];
  pinnedColumns: string[];
  columnWidths: Record<string, number>;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  filename?: string;
  includeHeaders?: boolean;
  selectedRowsOnly?: boolean;
  selectedColumnsOnly?: boolean;
  columns?: string[];
}

export interface BulkOperation<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (selectedRows: T[]) => Promise<void> | void;
  variant?: 'primary' | 'secondary' | 'danger';
  confirmMessage?: string;
  requiresConfirmation?: boolean;
  disabled?: (selectedRows: T[]) => boolean;
}

/**
 * Advanced filtering utilities
 */
export class DataTableFilters {
  /**
   * Apply advanced filters to data
   */
  static applyFilters<T>(data: T[], filters: AdvancedFilter[]): T[] {
    return data.filter(row => {
      return filters.every(filter => {
        const value = this.getNestedValue(row, filter.column);
        return this.evaluateFilter(value, filter);
      });
    });
  }

  /**
   * Get nested object value by path
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Evaluate a single filter condition
   */
  private static evaluateFilter(value: any, filter: AdvancedFilter): boolean {
    const { operator, value: filterValue, type } = filter;

    // Handle null/undefined values
    if (value == null) {
      return operator === 'equals' ? filterValue == null : false;
    }

    // Convert values based on type
    const normalizedValue = this.normalizeValue(value, type);
    const normalizedFilterValue = this.normalizeValue(filterValue, type);

    switch (operator) {
      case 'equals':
        return normalizedValue === normalizedFilterValue;
      
      case 'contains':
        return String(normalizedValue).toLowerCase()
          .includes(String(normalizedFilterValue).toLowerCase());
      
      case 'startsWith':
        return String(normalizedValue).toLowerCase()
          .startsWith(String(normalizedFilterValue).toLowerCase());
      
      case 'endsWith':
        return String(normalizedValue).toLowerCase()
          .endsWith(String(normalizedFilterValue).toLowerCase());
      
      case 'gt':
        return normalizedValue > normalizedFilterValue;
      
      case 'gte':
        return normalizedValue >= normalizedFilterValue;
      
      case 'lt':
        return normalizedValue < normalizedFilterValue;
      
      case 'lte':
        return normalizedValue <= normalizedFilterValue;
      
      case 'between':
        return Array.isArray(normalizedFilterValue) &&
          normalizedValue >= normalizedFilterValue[0] &&
          normalizedValue <= normalizedFilterValue[1];
      
      case 'in':
        return Array.isArray(normalizedFilterValue) &&
          normalizedFilterValue.includes(normalizedValue);
      
      case 'notIn':
        return Array.isArray(normalizedFilterValue) &&
          !normalizedFilterValue.includes(normalizedValue);
      
      default:
        return true;
    }
  }

  /**
   * Normalize values based on type for comparison
   */
  private static normalizeValue(value: any, type: FilterType): any {
    switch (type) {
      case 'number':
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      
      case 'date':
        return value instanceof Date ? value : new Date(value);
      
      case 'boolean':
        return Boolean(value);
      
      case 'text':
      default:
        return String(value);
    }
  }
}

/**
 * Export utilities
 */
export class DataTableExporter {
  /**
   * Export data to various formats
   */
  static async exportData<T>(
    data: T[], 
    columns: any[], 
    options: ExportOptions
  ): Promise<void> {
    const { format, filename = 'export', includeHeaders = true, selectedRowsOnly = false, columns: selectedColumns } = options;

    // Filter columns if specified
    const exportColumns = selectedColumns 
      ? columns.filter(col => selectedColumns.includes(col.key as string))
      : columns;

    // Prepare data for export
    const exportData = this.prepareExportData(data, exportColumns, includeHeaders);

    switch (format) {
      case 'csv':
        await this.exportToCSV(exportData, `${filename}.csv`);
        break;
      
      case 'xlsx':
        await this.exportToExcel(exportData, exportColumns, `${filename}.xlsx`, includeHeaders);
        break;
      
      case 'json':
        await this.exportToJSON(data, `${filename}.json`);
        break;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Prepare data for export by extracting values
   */
  private static prepareExportData<T>(
    data: T[], 
    columns: any[], 
    includeHeaders: boolean
  ): string[][] {
    const rows: string[][] = [];

    // Add headers if requested
    if (includeHeaders) {
      rows.push(columns.map(col => col.header));
    }

    // Add data rows
    data.forEach(row => {
      const rowData = columns.map(col => {
        const value = this.getCellValue(row, col);
        return this.formatValueForExport(value);
      });
      rows.push(rowData);
    });

    return rows;
  }

  /**
   * Get cell value using column accessor or key
   */
  private static getCellValue<T>(row: T, column: any): any {
    if (column.accessor) {
      return column.accessor(row);
    }
    if (typeof column.key === 'string' && column.key.includes('.')) {
      return column.key.split('.').reduce((obj: any, key: string) => obj?.[key], row);
    }
    return (row as any)[column.key];
  }

  /**
   * Format value for export (remove HTML, format dates, etc.)
   */
  private static formatValueForExport(value: any): string {
    if (value == null) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    
    // Remove HTML tags
    const stringValue = String(value);
    return stringValue.replace(/<[^>]*>/g, '');
  }

  /**
   * Export to CSV
   */
  private static async exportToCSV(data: string[][], filename: string): Promise<void> {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export to Excel
   */
  private static async exportToExcel(
    data: string[][], 
    columns: any[], 
    filename: string, 
    includeHeaders: boolean
  ): Promise<void> {
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths based on content
    const colWidths = columns.map(col => ({
      wch: Math.max(col.header.length, 20)
    }));
    ws['!cols'] = colWidths;

    // Apply header styling if headers are included
    if (includeHeaders && data.length > 0) {
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || '');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'E5E7EB' } }
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  }

  /**
   * Export to JSON
   */
  private static async exportToJSON<T>(data: T[], filename: string): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, filename);
  }
}

/**
 * Column management utilities
 */
export class ColumnManager {
  /**
   * Save column customization to localStorage
   */
  static saveConfiguration(tableId: string, config: ColumnCustomization): void {
    try {
      localStorage.setItem(`datatable_columns_${tableId}`, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save column configuration:', error);
    }
  }

  /**
   * Load column customization from localStorage
   */
  static loadConfiguration(tableId: string): ColumnCustomization | null {
    try {
      const stored = localStorage.getItem(`datatable_columns_${tableId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load column configuration:', error);
      return null;
    }
  }

  /**
   * Get default column configuration
   */
  static getDefaultConfiguration(): ColumnCustomization {
    return {
      columnOrder: [],
      hiddenColumns: [],
      pinnedColumns: [],
      columnWidths: {},
    };
  }

  // Legacy methods for backward compatibility
  static saveColumnConfig = this.saveConfiguration;
  static loadColumnConfig = this.loadConfiguration;

  /**
   * Apply column customization to columns array
   */
  static applyColumnConfig<T>(
    columns: T[], 
    config: ColumnCustomization[]
  ): T[] {
    if (!config || config.length === 0) return columns;

    // Create a map for quick lookup
    const configMap = new Map(config.map(c => [c.key, c]));

    // Apply configuration
    return columns
      .map(col => {
        const colConfig = configMap.get((col as any).key);
        if (colConfig) {
          return {
            ...col,
            visible: colConfig.visible,
            width: colConfig.width ? `${colConfig.width}px` : undefined,
            pinned: colConfig.pinned || false,
          };
        }
        return col;
      })
      .filter(col => (col as any).visible !== false)
      .sort((a, b) => {
        const aConfig = configMap.get((a as any).key);
        const bConfig = configMap.get((b as any).key);
        const aOrder = aConfig?.order ?? 999;
        const bOrder = bConfig?.order ?? 999;
        return aOrder - bOrder;
      });
  }

  /**
   * Generate default column configuration
   */
  static generateDefaultConfig(columns: any[]): ColumnCustomization[] {
    return columns.map((col, index) => ({
      key: col.key,
      visible: true,
      order: index,
      width: undefined,
      pinned: false,
    }));
  }
}

/**
 * Performance utilities
 */
export class DataTablePerformance {
  /**
   * Debounce function for search/filter inputs
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function for scroll events
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Calculate virtual scrolling parameters
   */
  static calculateVirtualization(
    totalItems: number,
    itemHeight: number,
    containerHeight: number,
    scrollTop: number
  ) {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.max(5, Math.floor(visibleItemCount * 0.5));
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleItemCount + bufferSize * 2);
    
    return {
      startIndex,
      endIndex,
      totalHeight: totalItems * itemHeight,
      offsetY: startIndex * itemHeight,
      visibleItems: endIndex - startIndex + 1,
    };
  }
}

/**
 * Bulk operations utilities
 */
export class BulkOperationsManager {
  /**
   * Execute a bulk operation with confirmation
   */
  static async executeBulkOperation<T>(
    operation: BulkOperation<T>,
    selectedRows: T[],
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      // Check if operation is disabled
      if (operation.disabled && operation.disabled(selectedRows)) {
        throw new Error('Operation is not available for the selected items');
      }

      // Show confirmation if required
      if (operation.confirmMessage) {
        const confirmed = window.confirm(
          operation.confirmMessage.replace('{count}', selectedRows.length.toString())
        );
        if (!confirmed) {
          return;
        }
      }

      // Execute the operation
      const result = await operation.action(selectedRows);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Bulk operation failed:', error);
      if (onError) {
        onError(error as Error);
      } else {
        // Default error handling
        alert(`Operation failed: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Get available operations for selected rows
   */
  static getAvailableOperations<T>(
    operations: BulkOperation<T>[],
    selectedRows: T[]
  ): BulkOperation<T>[] {
    return operations.filter(op => {
      return !op.disabled || !op.disabled(selectedRows);
    });
  }
}