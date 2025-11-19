/**
 * AdvancedFilters Component
 * Sophisticated filtering interface for DataTable
 */

import React, { useState, useCallback, useMemo } from 'react';
import { X, Plus, Filter, RotateCcw } from 'lucide-react';
import Button from '../../atoms/Button/Button';
import { AdvancedFilter, FilterType, FilterOperator, DataTableFilters } from '@/utils/datatable';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterableColumn {
  key: string;
  header: string;
  type: FilterType;
  options?: FilterOption[]; // For select/multiselect types
}

export interface AdvancedFiltersProps {
  columns: FilterableColumn[];
  filters: AdvancedFilter[];
  onFiltersChange: (filters: AdvancedFilter[]) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const OPERATORS_BY_TYPE: Record<FilterType, FilterOperator[]> = {
  text: ['equals', 'contains', 'startsWith', 'endsWith'],
  number: ['equals', 'gt', 'gte', 'lt', 'lte', 'between'],
  date: ['equals', 'gt', 'gte', 'lt', 'lte', 'between'],
  select: ['equals', 'in', 'notIn'],
  multiselect: ['in', 'notIn'],
  boolean: ['equals'],
  range: ['between'],
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  contains: 'Contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  between: 'Between',
  in: 'In',
  notIn: 'Not in',
};

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  columns,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilter[]>(filters);

  // Update local filters when props change
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Add a new filter
  const addFilter = useCallback(() => {
    const availableColumn = columns.find(col => 
      !localFilters.some(f => f.column === col.key)
    );
    
    if (availableColumn) {
      const newFilter: AdvancedFilter = {
        column: availableColumn.key,
        operator: OPERATORS_BY_TYPE[availableColumn.type][0],
        value: '',
        type: availableColumn.type,
      };
      setLocalFilters([...localFilters, newFilter]);
    }
  }, [localFilters, columns]);

  // Remove a filter
  const removeFilter = useCallback((index: number) => {
    setLocalFilters(localFilters.filter((_, i) => i !== index));
  }, [localFilters]);

  // Update filter property
  const updateFilter = useCallback((index: number, updates: Partial<AdvancedFilter>) => {
    setLocalFilters(localFilters.map((filter, i) => {
      if (i === index) {
        const updatedFilter = { ...filter, ...updates };
        
        // Reset operator if column type changed
        if (updates.column) {
          const column = columns.find(col => col.key === updates.column);
          if (column && column.type !== filter.type) {
            updatedFilter.operator = OPERATORS_BY_TYPE[column.type][0];
            updatedFilter.type = column.type;
            updatedFilter.value = '';
          }
        }
        
        return updatedFilter;
      }
      return filter;
    }));
  }, [localFilters, columns]);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    onFiltersChange(localFilters);
    onApplyFilters();
  }, [localFilters, onFiltersChange, onApplyFilters]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setLocalFilters([]);
    onClearFilters();
  }, [onClearFilters]);

  // Get available columns for dropdown
  const availableColumns = useMemo(() => {
    return columns.filter(col => 
      !localFilters.some(f => f.column === col.key)
    );
  }, [columns, localFilters]);

  // Render value input based on filter type
  const renderValueInput = (filter: AdvancedFilter, index: number) => {
    const column = columns.find(col => col.key === filter.column);
    
    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            placeholder="Enter value..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case 'number':
        if (filter.operator === 'between') {
          const values = Array.isArray(filter.value) ? filter.value : ['', ''];
          return (
            <div className="flex gap-2">
              <input
                type="number"
                value={values[0]}
                onChange={(e) => updateFilter(index, { 
                  value: [e.target.value, values[1]] 
                })}
                placeholder="Min"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              />
              <span className="self-center">to</span>
              <input
                type="number"
                value={values[1]}
                onChange={(e) => updateFilter(index, { 
                  value: [values[0], e.target.value] 
                })}
                placeholder="Max"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            placeholder="Enter number..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case 'date':
        if (filter.operator === 'between') {
          const values = Array.isArray(filter.value) ? filter.value : ['', ''];
          return (
            <div className="flex gap-2">
              <input
                type="date"
                value={values[0]}
                onChange={(e) => updateFilter(index, { 
                  value: [e.target.value, values[1]] 
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                value={values[1]}
                onChange={(e) => updateFilter(index, { 
                  value: [values[0], e.target.value] 
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        }
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case 'select':
        if (filter.operator === 'in' || filter.operator === 'notIn') {
          const selectedValues = Array.isArray(filter.value) ? filter.value : [];
          return (
            <div className="space-y-2">
              {column?.options?.map(option => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      updateFilter(index, { value: newValues });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          );
        }
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select option...</option>
            {column?.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value === 'true' })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          leftIcon={<Filter className="w-4 h-4" />}
        >
          Advanced Filters
          {filters.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {filters.length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          ariaLabel="Close filters"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {localFilters.map((filter, index) => {
          const column = columns.find(col => col.key === filter.column);
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-md border">
              {/* Column Selection */}
              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Column
                </label>
                <select
                  value={filter.column}
                  onChange={(e) => updateFilter(index, { column: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {columns.map(col => (
                    <option key={col.key} value={col.key}>
                      {col.header}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operator Selection */}
              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Operator
                </label>
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, { 
                    operator: e.target.value as FilterOperator 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPERATORS_BY_TYPE[filter.type].map(op => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Value
                </label>
                {renderValueInput(filter, index)}
              </div>

              {/* Remove Filter */}
              <div className="pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(index)}
                  ariaLabel="Remove filter"
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Add Filter Button */}
        {availableColumns.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={addFilter}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Filter
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Clear All
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyFilters}
          >
            Apply Filters ({localFilters.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;