/**
 * ColumnCustomization Component
 * Drag-and-drop column management interface
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  Pin,
  PinOff,
  RotateCcw,
  X,
} from 'lucide-react';
import Button from '../../atoms/Button/Button';
import { TableColumn, ColumnManager, ColumnCustomization as ColumnConfig } from '@/utils/datatable';

export interface ColumnCustomizationProps {
  columns: TableColumn[];
  columnConfig: ColumnConfig;
  onColumnConfigChange: (config: ColumnConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
  tableId: string; // For persistence
}

const ColumnCustomization: React.FC<ColumnCustomizationProps> = ({
  columns,
  columnConfig,
  onColumnConfigChange,
  isOpen,
  onToggle,
  tableId,
}) => {
  const [localConfig, setLocalConfig] = useState<ColumnConfig>(columnConfig);
  const columnManager = useMemo(() => new ColumnManager(tableId), [tableId]);

  // Update local config when props change
  React.useEffect(() => {
    setLocalConfig(columnConfig);
  }, [columnConfig]);

  // Get ordered columns based on configuration
  const orderedColumns = useMemo(() => {
    const order = localConfig.order || columns.map(col => col.key);
    return order.map(key => columns.find(col => col.key === key)).filter(Boolean) as TableColumn[];
  }, [columns, localConfig.order]);

  // Handle drag end
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newOrder = [...(localConfig.order || columns.map(col => col.key))];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, removed);

    setLocalConfig({ ...localConfig, order: newOrder });
  }, [localConfig, columns]);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback((columnKey: string) => {
    const hidden = localConfig.hiddenColumns || [];
    const newHidden = hidden.includes(columnKey)
      ? hidden.filter(key => key !== columnKey)
      : [...hidden, columnKey];

    setLocalConfig({ ...localConfig, hiddenColumns: newHidden });
  }, [localConfig]);

  // Toggle column pinning
  const toggleColumnPinning = useCallback((columnKey: string) => {
    const pinned = localConfig.pinnedColumns || [];
    const newPinned = pinned.includes(columnKey)
      ? pinned.filter(key => key !== columnKey)
      : [...pinned, columnKey];

    setLocalConfig({ ...localConfig, pinnedColumns: newPinned });
  }, [localConfig]);

  // Update column width
  const updateColumnWidth = useCallback((columnKey: string, width: number) => {
    const widths = { ...localConfig.columnWidths };
    if (width <= 0) {
      delete widths[columnKey];
    } else {
      widths[columnKey] = width;
    }
    setLocalConfig({ ...localConfig, columnWidths: widths });
  }, [localConfig]);

  // Apply configuration
  const applyConfiguration = useCallback(() => {
    columnManager.saveConfiguration(localConfig);
    onColumnConfigChange(localConfig);
    onToggle();
  }, [localConfig, columnManager, onColumnConfigChange, onToggle]);

  // Reset to default configuration
  const resetConfiguration = useCallback(() => {
    const defaultConfig = columnManager.getDefaultConfiguration(columns);
    setLocalConfig(defaultConfig);
  }, [columnManager, columns]);

  // Show all columns
  const showAllColumns = useCallback(() => {
    setLocalConfig({ ...localConfig, hiddenColumns: [] });
  }, [localConfig]);

  // Hide all columns
  const hideAllColumns = useCallback(() => {
    setLocalConfig({ 
      ...localConfig, 
      hiddenColumns: columns.map(col => col.key) 
    });
  }, [localConfig, columns]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        leftIcon={<Settings className="w-4 h-4" />}
      >
        Columns
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Customize Columns
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              ariaLabel="Close column customization"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Drag to reorder, toggle visibility, pin columns, and adjust widths
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={showAllColumns}
            >
              Show All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={hideAllColumns}
            >
              Hide All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetConfiguration}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
          </div>

          {/* Column List */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {orderedColumns.map((column, index) => {
                    const isHidden = localConfig.hiddenColumns?.includes(column.key);
                    const isPinned = localConfig.pinnedColumns?.includes(column.key);
                    const width = localConfig.columnWidths?.[column.key] || '';

                    return (
                      <Draggable
                        key={column.key}
                        draggableId={column.key}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              flex items-center gap-3 p-3 bg-white border rounded-md
                              ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}
                              ${isHidden ? 'opacity-50' : ''}
                            `}
                          >
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="text-gray-400 hover:text-gray-600 cursor-move"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Column Info */}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {column.header}
                              </div>
                              <div className="text-sm text-gray-500">
                                {column.key}
                              </div>
                            </div>

                            {/* Width Input */}
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500">Width:</label>
                              <input
                                type="number"
                                value={width}
                                onChange={(e) => updateColumnWidth(
                                  column.key, 
                                  parseInt(e.target.value) || 0
                                )}
                                placeholder="Auto"
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-400">px</span>
                            </div>

                            {/* Pin Toggle */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleColumnPinning(column.key)}
                              ariaLabel={isPinned ? 'Unpin column' : 'Pin column'}
                              className={isPinned ? 'text-blue-600' : 'text-gray-400'}
                            >
                              {isPinned ? (
                                <Pin className="w-4 h-4" />
                              ) : (
                                <PinOff className="w-4 h-4" />
                              )}
                            </Button>

                            {/* Visibility Toggle */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleColumnVisibility(column.key)}
                              ariaLabel={isHidden ? 'Show column' : 'Hide column'}
                              className={isHidden ? 'text-red-600' : 'text-green-600'}
                            >
                              {isHidden ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {orderedColumns.filter(col => 
                !localConfig.hiddenColumns?.includes(col.key)
              ).length} of {orderedColumns.length} columns visible
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onToggle}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={applyConfiguration}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnCustomization;