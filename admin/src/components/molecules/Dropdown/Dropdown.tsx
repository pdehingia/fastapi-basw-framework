/**
 * Dropdown Molecule Component  
 * Accessible dropdown menu with keyboard navigation and positioning
 */

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { shallowEqual } from '@/utils/performance';
import { Icon, Button } from '@/components/atoms';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  description?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string, option: DropdownOption) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  // Trigger customization
  trigger?: 'button' | 'input' | 'custom';
  triggerElement?: React.ReactNode;
  triggerClassName?: string;
  // Dropdown customization
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'auto';
  portal?: boolean;
  maxHeight?: string;
  minWidth?: string;
  searchable?: boolean;
  multiSelect?: boolean;
  clearable?: boolean;
  className?: string;
  menuClassName?: string;
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option...',
  onSelect,
  disabled = false,
  loading = false,
  error,
  trigger = 'button',
  triggerElement,
  triggerClassName = '',
  position = 'bottom-left',
  portal = false,
  maxHeight = '200px',
  minWidth = '200px',
  searchable = false,
  multiSelect = false,
  clearable = false,
  className = '',
  menuClassName = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiSelect ? (Array.isArray(value) ? value as string[] : value ? [value] : []) : []
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get current selection display
  const getDisplayValue = useCallback(() => {
    if (multiSelect) {
      const selected = options.filter(opt => selectedValues.includes(opt.value));
      if (selected.length === 0) return placeholder;
      if (selected.length === 1) return selected[0].label;
      return `${selected.length} items selected`;
    }
    
    const selected = options.find(opt => opt.value === value);
    return selected ? selected.label : placeholder;
  }, [multiSelect, selectedValues, value, options, placeholder]);

  // Handle option selection
  const handleSelect = useCallback((option: DropdownOption) => {
    if (option.disabled) return;

    if (multiSelect) {
      const newSelected = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      
      setSelectedValues(newSelected);
      onSelect(option.value, option);
    } else {
      setIsOpen(false);
      onSelect(option.value, option);
    }
  }, [multiSelect, selectedValues, onSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1;
          return next >= filteredOptions.length ? 0 : next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? filteredOptions.length - 1 : next;
        });
        break;

      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [isOpen, focusedIndex, filteredOptions, handleSelect]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Calculate dropdown position
  const getDropdownStyle = useCallback(() => {
    if (!triggerRef.current) return {};

    const rect = triggerRef.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      minWidth: minWidth,
      maxHeight: maxHeight,
    };

    if (portal) {
      // Position for portal rendering
      switch (position) {
        case 'bottom-left':
        case 'auto':
          style.top = rect.bottom + window.scrollY;
          style.left = rect.left + window.scrollX;
          break;
        case 'bottom-right':
          style.top = rect.bottom + window.scrollY;
          style.right = window.innerWidth - rect.right - window.scrollX;
          break;
        case 'top-left':
          style.bottom = window.innerHeight - rect.top - window.scrollY;
          style.left = rect.left + window.scrollX;
          break;
        case 'top-right':
          style.bottom = window.innerHeight - rect.top - window.scrollY;
          style.right = window.innerWidth - rect.right - window.scrollX;
          break;
      }
      style.position = 'absolute';
      style.zIndex = 50;
    }

    return style;
  }, [position, portal, minWidth, maxHeight]);

  // Clear selection
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect) {
      setSelectedValues([]);
    }
    onSelect('', { value: '', label: '' });
  }, [multiSelect, onSelect]);

  // Render trigger
  const renderTrigger = () => {
    if (trigger === 'custom' && triggerElement) {
      return (
        <div 
          ref={triggerRef as any}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={className}
        >
          {triggerElement}
        </div>
      );
    }

    if (trigger === 'input') {
      return (
        <div className={`relative ${className}`}>
          <input
            type="text"
            value={getDisplayValue()}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : ''}
              ${triggerClassName}
            `}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {clearable && (multiSelect ? selectedValues.length > 0 : value) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear selection"
              >
                <Icon name="XMarkIcon" size="sm" />
              </button>
            )}
            <Icon 
              name={isOpen ? "ChevronUpIcon" : "ChevronDownIcon"} 
              size="sm" 
              className="text-gray-400" 
            />
          </div>
        </div>
      );
    }

    // Default button trigger
    return (
      <Button
        ref={triggerRef}
        variant="secondary"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          justify-between min-w-[200px] text-left
          ${triggerClassName}
          ${className}
        `}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">
          {loading ? 'Loading...' : getDisplayValue()}
        </span>
        <Icon 
          name={isOpen ? "ChevronUpIcon" : "ChevronDownIcon"} 
          size="sm" 
          className="text-gray-400 flex-shrink-0" 
        />
      </Button>
    );
  };

  // Render dropdown menu
  const renderMenu = () => {
    if (!isOpen) return null;

    const menuContent = (
      <div
        ref={menuRef}
        style={getDropdownStyle()}
        className={`
          bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden
          ${portal ? 'fixed' : 'absolute top-full left-0 mt-1 w-full'}
          ${menuClassName}
        `}
        role="listbox"
        aria-label="Options"
      >
        {/* Search input */}
        {searchable && (
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Options */}
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = multiSelect 
                ? selectedValues.includes(option.value)
                : option.value === value;
              const isFocused = index === focusedIndex;

              if (option.divider) {
                return <div key={`divider-${index}`} className="border-t border-gray-100 my-1" />;
              }

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={`
                    w-full px-3 py-2 text-left text-sm flex items-center space-x-2
                    ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                    ${isFocused ? 'bg-gray-100' : ''}
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.icon && (
                    <Icon name={option.icon as any} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Icon name="CheckIcon" size="sm" className="text-blue-600" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    );

    return portal ? createPortal(menuContent, document.body) : menuContent;
  };

  return (
    <div className={`relative ${trigger !== 'custom' ? 'inline-block' : ''}`}>
      {renderTrigger()}
      {renderMenu()}
      {error && (
        <div className="mt-1 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};

// Memoize for performance
const MemoizedDropdown = memo(Dropdown, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedDropdown.displayName = 'Dropdown';

export default MemoizedDropdown;