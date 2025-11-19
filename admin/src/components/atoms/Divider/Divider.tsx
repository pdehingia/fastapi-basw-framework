/**
 * Divider Atom Component
 * Visual separators with text labels and multiple orientations
 */

import React, { memo } from 'react';
import { shallowEqual } from '@/utils/performance';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: 'gray' | 'primary' | 'secondary';
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  className?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  color = 'gray',
  label,
  labelPosition = 'center',
  className = '',
  spacing = 'md',
}) => {
  // Thickness mappings
  const thicknessClasses = {
    horizontal: {
      thin: 'border-t',
      medium: 'border-t-2',
      thick: 'border-t-4',
    },
    vertical: {
      thin: 'border-l',
      medium: 'border-l-2', 
      thick: 'border-l-4',
    },
  };

  // Color mappings
  const colorClasses = {
    gray: 'border-gray-200',
    primary: 'border-blue-200',
    secondary: 'border-purple-200',
  };

  // Variant mappings
  const variantClasses = {
    solid: '',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    gradient: '',
  };

  // Spacing mappings
  const spacingClasses = {
    horizontal: {
      xs: 'my-2',
      sm: 'my-4',
      md: 'my-6',
      lg: 'my-8',
      xl: 'my-12',
    },
    vertical: {
      xs: 'mx-2',
      sm: 'mx-4',
      md: 'mx-6',
      lg: 'mx-8',
      xl: 'mx-12',
    },
  };

  // Label position classes
  const labelPositionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Horizontal divider
  if (orientation === 'horizontal') {
    // With label
    if (label) {
      return (
        <div className={`relative flex items-center ${spacingClasses.horizontal[spacing]} ${className}`}>
          <div 
            className={`
              flex-1 
              ${thicknessClasses.horizontal[thickness]} 
              ${variant === 'gradient' 
                ? 'h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent border-0' 
                : `${colorClasses[color]} ${variantClasses[variant]}`
              }
            `} 
          />
          <div className={`flex ${labelPositionClasses[labelPosition]} flex-1`}>
            <span className="px-4 text-sm text-gray-500 bg-white">
              {label}
            </span>
          </div>
          <div 
            className={`
              flex-1
              ${thicknessClasses.horizontal[thickness]} 
              ${variant === 'gradient' 
                ? 'h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent border-0' 
                : `${colorClasses[color]} ${variantClasses[variant]}`
              }
            `} 
          />
        </div>
      );
    }

    // Without label
    return (
      <hr 
        className={`
          ${variant === 'gradient' 
            ? 'h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent border-0' 
            : `${thicknessClasses.horizontal[thickness]} ${colorClasses[color]} ${variantClasses[variant]}`
          }
          ${spacingClasses.horizontal[spacing]} 
          ${className}
        `}
        role="separator"
        aria-label={label || 'Section divider'}
      />
    );
  }

  // Vertical divider
  if (orientation === 'vertical') {
    // With label (rotate label for vertical)
    if (label) {
      return (
        <div className={`relative flex flex-col items-center h-full ${spacingClasses.vertical[spacing]} ${className}`}>
          <div 
            className={`
              flex-1 w-px
              ${thicknessClasses.vertical[thickness]} 
              ${variant === 'gradient' 
                ? 'bg-gradient-to-b from-transparent via-gray-300 to-transparent border-0' 
                : `${colorClasses[color]} ${variantClasses[variant]}`
              }
            `} 
          />
          <div className="py-2">
            <span className="text-sm text-gray-500 bg-white transform rotate-90 whitespace-nowrap">
              {label}
            </span>
          </div>
          <div 
            className={`
              flex-1 w-px
              ${thicknessClasses.vertical[thickness]} 
              ${variant === 'gradient' 
                ? 'bg-gradient-to-b from-transparent via-gray-300 to-transparent border-0' 
                : `${colorClasses[color]} ${variantClasses[variant]}`
              }
            `} 
          />
        </div>
      );
    }

    // Without label
    return (
      <div 
        className={`
          ${variant === 'gradient' 
            ? 'w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent' 
            : `${thicknessClasses.vertical[thickness]} ${colorClasses[color]} ${variantClasses[variant]}`
          }
          ${spacingClasses.vertical[spacing]} 
          h-full
          ${className}
        `}
        role="separator"
        aria-orientation="vertical"
        aria-label={label || 'Section divider'}
      />
    );
  }

  return null;
};

// Memoize for performance
const MemoizedDivider = memo(Divider, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedDivider.displayName = 'Divider';

export default MemoizedDivider;