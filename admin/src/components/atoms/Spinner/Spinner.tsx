/**
 * Spinner Atom Component
 * Loading indicators with multiple variants and sizes
 */

import React, { memo } from 'react';
import { shallowEqual } from '@/utils/performance';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spin' | 'pulse' | 'dots' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  'aria-label'?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'spin',
  color = 'primary',
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}) => {
  // Size mappings
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  // Color mappings
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  const baseClasses = `inline-block ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  // Spin variant (default circular spinner)
  if (variant === 'spin') {
    return (
      <svg
        className={`${baseClasses} animate-spin`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={ariaLabel}
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
        <span className="sr-only">{ariaLabel}</span>
      </svg>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div
        className={`${baseClasses} bg-current rounded-full animate-pulse`}
        aria-label={ariaLabel}
        role="status"
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }

  // Dots variant (three bouncing dots)
  if (variant === 'dots') {
    const dotSize = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
      xl: 'w-3 h-3',
    };

    return (
      <div
        className={`flex space-x-1 ${className}`}
        aria-label={ariaLabel}
        role="status"
      >
        <div className={`${dotSize[size]} ${colorClasses[color]} bg-current rounded-full animate-bounce`} />
        <div className={`${dotSize[size]} ${colorClasses[color]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }} />
        <div className={`${dotSize[size]} ${colorClasses[color]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }} />
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }

  // Bars variant (vertical bars)
  if (variant === 'bars') {
    const barHeight = {
      xs: 'h-3',
      sm: 'h-4',
      md: 'h-5',
      lg: 'h-6',
      xl: 'h-8',
    };

    const barWidth = 'w-0.5';

    return (
      <div
        className={`flex items-end space-x-0.5 ${className}`}
        aria-label={ariaLabel}
        role="status"
      >
        <div className={`${barWidth} ${barHeight[size]} ${colorClasses[color]} bg-current animate-pulse`} />
        <div className={`${barWidth} ${barHeight[size]} ${colorClasses[color]} bg-current animate-pulse`} style={{ animationDelay: '0.15s' }} />
        <div className={`${barWidth} ${barHeight[size]} ${colorClasses[color]} bg-current animate-pulse`} style={{ animationDelay: '0.3s' }} />
        <div className={`${barWidth} ${barHeight[size]} ${colorClasses[color]} bg-current animate-pulse`} style={{ animationDelay: '0.45s' }} />
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }

  // Fallback to spin variant
  return (
    <svg
      className={`${baseClasses} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
      <span className="sr-only">{ariaLabel}</span>
    </svg>
  );
};

// Memoize for performance
const MemoizedSpinner = memo(Spinner, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedSpinner.displayName = 'Spinner';

export default MemoizedSpinner;