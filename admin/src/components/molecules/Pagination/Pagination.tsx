/**
 * Pagination Molecule Component
 * Advanced pagination with page controls, size selection, and navigation
 */

import { memo, useMemo, useCallback } from 'react';
import { shallowEqual } from '@/utils/performance';
import { Icon, Button, Text } from '@/components/atoms';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  // Display options
  showPageInfo?: boolean;
  showItemsPerPage?: boolean;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  // Customization
  maxVisiblePages?: number;
  itemsPerPageOptions?: number[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'full';
  className?: string;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showPageInfo = true,
  showItemsPerPage = false,
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  maxVisiblePages = 7,
  itemsPerPageOptions = [10, 20, 50, 100],
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false,
}) => {
  // Calculate page range
  const pageRange = useMemo(() => {
    const range: number[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Calculate start and end of visible range
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      // Add first page and ellipsis if needed
      if (start > 1) {
        range.push(1);
        if (start > 2) {
          range.push(-1); // Ellipsis marker
        }
      }
      
      // Add visible page numbers
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          range.push(-1); // Ellipsis marker
        }
        range.push(totalPages);
      }
    }
    
    return range;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Calculate item range for display
  const itemRange = useMemo(() => {
    if (!totalItems) return null;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    return { start, end };
  }, [currentPage, itemsPerPage, totalItems]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !disabled) {
      onPageChange(page);
    }
  }, [onPageChange, totalPages, disabled]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
  }, [onItemsPerPageChange]);

  // Button size mapping
  const buttonSizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };

  // Early return if no pages
  if (totalPages <= 1 && variant !== 'full') {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Page info and items per page */}
      <div className="flex items-center space-x-4">
        {/* Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <Text variant="small" color="muted">Show:</Text>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              disabled={disabled}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Text variant="small" color="muted">per page</Text>
          </div>
        )}

        {/* Page info */}
        {showPageInfo && (
          <div className="flex items-center space-x-1">
            {itemRange && totalItems ? (
              <Text variant="small" color="muted">
                Showing {itemRange.start.toLocaleString()}-{itemRange.end.toLocaleString()} of {totalItems.toLocaleString()}
              </Text>
            ) : (
              <Text variant="small" color="muted">
                Page {currentPage} of {totalPages}
              </Text>
            )}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={disabled || currentPage === 1}
            className={buttonSizes[size]}
            aria-label="Go to first page"
          >
            <Icon name="ChevronDoubleLeftIcon" size={iconSizes[size]} />
          </Button>
        )}

        {/* Previous page */}
        {showPrevNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={buttonSizes[size]}
            aria-label="Go to previous page"
          >
            <Icon name="ChevronLeftIcon" size={iconSizes[size]} />
          </Button>
        )}

        {/* Page numbers */}
        {showPageNumbers && pageRange.map((page, index) => {
          if (page === -1) {
            // Ellipsis
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? "primary" : "ghost"}
              size="sm"
              onClick={() => handlePageChange(page)}
              disabled={disabled}
              className={`${buttonSizes[size]} min-w-[2rem]`}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Button>
          );
        })}

        {/* Next page */}
        {showPrevNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className={buttonSizes[size]}
            aria-label="Go to next page"
          >
            <Icon name="ChevronRightIcon" size={iconSizes[size]} />
          </Button>
        )}

        {/* Last page */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || currentPage === totalPages}
            className={buttonSizes[size]}
            aria-label="Go to last page"
          >
            <Icon name="ChevronDoubleRightIcon" size={iconSizes[size]} />
          </Button>
        )}
      </div>
    </div>
  );
};

// Memoize for performance
const MemoizedPagination = memo(Pagination, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedPagination.displayName = 'Pagination';

export default MemoizedPagination;