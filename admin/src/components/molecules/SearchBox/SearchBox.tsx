/**
 * SearchBox Molecule Component
 * Search input with filtering capabilities and debounced queries
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { shallowEqual, debounce } from '@/utils/performance';
import { Icon, Input, Spinner } from '@/components/atoms';

export interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  debounceMs?: number;
  showSearchIcon?: boolean;
  showClearIcon?: boolean;
  autoFocus?: boolean;
  className?: string;
  // Filter options
  filters?: Array<{
    id: string;
    label: string;
    value: string;
    active: boolean;
  }>;
  onFilterChange?: (filterId: string, active: boolean) => void;
  // Results preview
  resultCount?: number;
  showResultCount?: boolean;
  // Keyboard shortcuts
  shortcutKey?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  onClear,
  loading = false,
  disabled = false,
  size = 'md',
  debounceMs = 300,
  showSearchIcon = true,
  showClearIcon = true,
  autoFocus = false,
  className = '',
  filters = [],
  onFilterChange,
  resultCount,
  showResultCount = false,
  shortcutKey = '/',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (onSearch) {
        onSearch(query);
      }
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Handle input changes
  const handleInputChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    debouncedSearch(newValue);
  }, [onChange, debouncedSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalValue('');
    if (onChange) {
      onChange('');
    }
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch('');
    }
    inputRef.current?.focus();
  }, [onChange, onClear, onSearch]);

  // Handle filter toggle
  const handleFilterToggle = useCallback((filterId: string) => {
    if (onFilterChange) {
      const filter = filters.find(f => f.id === filterId);
      if (filter) {
        onFilterChange(filterId, !filter.active);
      }
    }
  }, [filters, onFilterChange]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search on shortcut key
      if (event.key === shortcutKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }
      
      // Clear on Escape
      if (event.key === 'Escape' && isFocused) {
        handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey, isFocused, handleClear]);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Size mappings
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          {showSearchIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {loading ? (
                <Spinner size="xs" color="gray" />
              ) : (
                <Icon name="MagnifyingGlassIcon" size="sm" />
              )}
            </div>
          )}
          
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={`
              ${showSearchIcon ? 'pl-10' : ''}
              ${showClearIcon && localValue ? 'pr-10' : ''}
              ${sizeClasses[size]}
            `}
            autoFocus={autoFocus}
          />

          {/* Clear Button */}
          {showClearIcon && localValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <Icon name="XMarkIcon" size="sm" />
            </button>
          )}
        </div>

        {/* Shortcut hint */}
        {shortcutKey && !isFocused && !localValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">
              {shortcutKey}
            </kbd>
          </div>
        )}
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleFilterToggle(filter.id)}
              disabled={disabled}
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${filter.active
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {filter.label}
              {filter.active && (
                <Icon name="XMarkIcon" size="xs" className="ml-1 -mr-1" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Result Count */}
      {showResultCount && typeof resultCount === 'number' && localValue && (
        <div className="mt-2 text-sm text-gray-500">
          {resultCount === 0 ? (
            'No results found'
          ) : resultCount === 1 ? (
            '1 result found'
          ) : (
            `${resultCount.toLocaleString()} results found`
          )}
        </div>
      )}
    </div>
  );
};

// Memoize for performance
const MemoizedSearchBox = memo(SearchBox, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedSearchBox.displayName = 'SearchBox';

export default MemoizedSearchBox;