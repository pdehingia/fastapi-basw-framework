/**
 * Progress Atom Component
 * Progress indicators with multiple variants and customization options
 */

import React, { memo, useMemo } from 'react';
import { shallowEqual } from '@/utils/performance';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  animated?: boolean;
  striped?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  label,
  className = '',
  trackClassName = '',
  barClassName = '',
  animated = false,
  striped = false,
}) => {
  // Calculate percentage
  const percentage = useMemo(() => {
    const clampedValue = Math.max(0, Math.min(value, max));
    return (clampedValue / max) * 100;
  }, [value, max]);

  // Format percentage for display
  const formattedPercentage = useMemo(() => {
    return Math.round(percentage);
  }, [percentage]);

  // Size mappings
  const linearSizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const circularSizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const strokeWidths = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 5,
  };

  // Color mappings
  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  const strokeColors = {
    primary: 'stroke-blue-600',
    secondary: 'stroke-gray-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    error: 'stroke-red-600',
  };

  // Linear Progress
  if (variant === 'linear') {
    const stripedPattern = striped ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem]' : '';
    const animatedClass = animated ? 'animate-pulse' : '';

    return (
      <div className={`w-full ${className}`}>
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              {label || `Progress`}
            </span>
            {showLabel && (
              <span className="text-sm text-gray-500">
                {formattedPercentage}%
              </span>
            )}
          </div>
        )}
        
        <div 
          className={`
            w-full ${linearSizes[size]} bg-gray-200 rounded-full overflow-hidden 
            ${trackClassName}
          `}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${formattedPercentage}%`}
        >
          <div
            className={`
              h-full ${colorClasses[color]} transition-all duration-500 ease-out
              ${stripedPattern} ${animatedClass} ${barClassName}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Circular Progress
  if (variant === 'circular') {
    const size_num = {
      xs: 32,
      sm: 48,
      md: 64,
      lg: 80,
    };

    const radius = (size_num[size] - strokeWidths[size] * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          className={circularSizes[size]}
          viewBox={`0 0 ${size_num[size]} ${size_num[size]}`}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${formattedPercentage}%`}
        >
          {/* Background circle */}
          <circle
            cx={size_num[size] / 2}
            cy={size_num[size] / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            fill="none"
            className="text-gray-200"
          />
          
          {/* Progress circle */}
          <circle
            cx={size_num[size] / 2}
            cy={size_num[size] / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${strokeColors[color]} transition-all duration-500 ease-out transform -rotate-90 origin-center`}
            style={{
              transformOrigin: `${size_num[size] / 2}px ${size_num[size] / 2}px`,
            }}
          />
        </svg>
        
        {/* Center label */}
        {(showLabel || label) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showLabel && (
              <span className={`
                text-sm font-semibold text-gray-700
                ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
              `}>
                {formattedPercentage}%
              </span>
            )}
            {label && (
              <span className={`
                text-gray-500 text-center leading-tight
                ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-xs' : 'text-sm'}
              `}>
                {label}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Memoize for performance
const MemoizedProgress = memo(Progress, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedProgress.displayName = 'Progress';

export default MemoizedProgress;