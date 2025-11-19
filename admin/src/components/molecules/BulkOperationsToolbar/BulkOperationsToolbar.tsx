/**
 * BulkOperationsToolbar Component
 * Toolbar for batch operations on selected table rows
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Trash2,
  Download,
  Edit3,
  Archive,
  MoreHorizontal,
  AlertTriangle,
  X,
  CheckCircle,
} from 'lucide-react';
import Button from '../../atoms/Button/Button';
import { BulkOperationsManager, BulkOperation } from '@/utils/datatable';

export interface BulkOperationsToolbarProps {
  selectedIds: string[];
  totalCount: number;
  operations: BulkOperation[];
  onClearSelection: () => void;
  onExecuteOperation: (operation: BulkOperation, ids: string[]) => Promise<void>;
  isVisible: boolean;
}

interface OperationProgress {
  operation: string;
  completed: number;
  total: number;
  isRunning: boolean;
  error?: string;
}

interface ConfirmationDialog {
  operation: BulkOperation;
  isOpen: boolean;
}

const BulkOperationsToolbar: React.FC<BulkOperationsToolbarProps> = ({
  selectedIds,
  totalCount,
  operations,
  onClearSelection,
  onExecuteOperation,
  isVisible,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    operation: {} as BulkOperation,
    isOpen: false,
  });
  const [progress, setProgress] = useState<OperationProgress | null>(null);
  const [showMoreOperations, setShowMoreOperations] = useState(false);

  const bulkManager = useMemo(() => new BulkOperationsManager(), []);

  // Group operations by type
  const { primaryOperations, secondaryOperations } = useMemo(() => {
    const primary: BulkOperation[] = [];
    const secondary: BulkOperation[] = [];

    operations.forEach(op => {
      if (['delete', 'export', 'edit'].includes(op.id)) {
        primary.push(op);
      } else {
        secondary.push(op);
      }
    });

    return { primaryOperations: primary, secondaryOperations: secondary };
  }, [operations]);

  // Handle operation click
  const handleOperationClick = useCallback((operation: BulkOperation) => {
    if (operation.requiresConfirmation) {
      setConfirmDialog({ operation, isOpen: true });
    } else {
      executeOperation(operation);
    }
  }, []);

  // Execute operation
  const executeOperation = useCallback(async (operation: BulkOperation) => {
    try {
      setProgress({
        operation: operation.label,
        completed: 0,
        total: selectedIds.length,
        isRunning: true,
      });

      // Execute operation with progress tracking
      await onExecuteOperation(operation, selectedIds);

      setProgress({
        operation: operation.label,
        completed: selectedIds.length,
        total: selectedIds.length,
        isRunning: false,
      });

      // Auto-hide progress after success
      setTimeout(() => {
        setProgress(null);
        onClearSelection();
      }, 2000);

    } catch (error) {
      setProgress({
        operation: operation.label,
        completed: 0,
        total: selectedIds.length,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Operation failed',
      });
    }
  }, [selectedIds, onExecuteOperation, onClearSelection]);

  // Confirm operation
  const confirmOperation = useCallback(() => {
    executeOperation(confirmDialog.operation);
    setConfirmDialog({ operation: {} as BulkOperation, isOpen: false });
  }, [confirmDialog.operation, executeOperation]);

  // Cancel confirmation
  const cancelConfirmation = useCallback(() => {
    setConfirmDialog({ operation: {} as BulkOperation, isOpen: false });
  }, []);

  // Get operation icon
  const getOperationIcon = (operationId: string) => {
    switch (operationId) {
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      case 'edit':
        return <Edit3 className="w-4 h-4" />;
      case 'archive':
        return <Archive className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  // Get operation variant based on type
  const getOperationVariant = (operationId: string) => {
    switch (operationId) {
      case 'delete':
        return 'destructive' as const;
      case 'export':
        return 'primary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (!isVisible || selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bulk Operations Toolbar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 z-40">
        <div className="flex items-center gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              {selectedIds.length} selected
            </span>
            {totalCount > 0 && (
              <span className="text-gray-500 text-sm">
                of {totalCount}
              </span>
            )}
          </div>

          <div className="h-4 border-l border-gray-300" />

          {/* Primary Operations */}
          <div className="flex items-center gap-2">
            {primaryOperations.map(operation => (
              <Button
                key={operation.id}
                variant={getOperationVariant(operation.id)}
                size="sm"
                onClick={() => handleOperationClick(operation)}
                leftIcon={getOperationIcon(operation.id)}
                disabled={progress?.isRunning || selectedIds.length === 0}
              >
                {operation.label}
              </Button>
            ))}

            {/* More Operations */}
            {secondaryOperations.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMoreOperations(!showMoreOperations)}
                  leftIcon={<MoreHorizontal className="w-4 h-4" />}
                >
                  More
                </Button>

                {showMoreOperations && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-300 rounded-md shadow-lg py-1 min-w-[150px]">
                    {secondaryOperations.map(operation => (
                      <button
                        key={operation.id}
                        onClick={() => {
                          handleOperationClick(operation);
                          setShowMoreOperations(false);
                        }}
                        disabled={progress?.isRunning}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                      >
                        {getOperationIcon(operation.id)}
                        {operation.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-4 border-l border-gray-300" />

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            ariaLabel="Clear selection"
            disabled={progress?.isRunning}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      {progress && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 z-40 min-w-[300px]">
          <div className="flex items-center gap-3">
            {progress.isRunning ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
            ) : progress.error ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {progress.operation}
              </div>
              
              {progress.error ? (
                <div className="text-sm text-red-600">{progress.error}</div>
              ) : (
                <div className="text-sm text-gray-600">
                  {progress.completed} of {progress.total} completed
                </div>
              )}
              
              {!progress.error && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(progress.completed / progress.total) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>
            
            {!progress.isRunning && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProgress(null)}
                ariaLabel="Close progress"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Operation
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to {confirmDialog.operation.label?.toLowerCase()} {selectedIds.length} selected item{selectedIds.length !== 1 ? 's' : ''}?
                {confirmDialog.operation.id === 'delete' && (
                  <span className="block mt-2 text-red-600 font-medium">
                    This action cannot be undone.
                  </span>
                )}
              </p>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={cancelConfirmation}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmDialog.operation.id === 'delete' ? 'destructive' : 'primary'}
                  onClick={confirmOperation}
                >
                  {confirmDialog.operation.label}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperationsToolbar;