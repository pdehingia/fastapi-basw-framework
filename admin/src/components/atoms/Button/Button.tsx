/**
 * Button atom component
 * Accessible button component with WCAG 2.1 AA compliance
 */

import React from 'react';
import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { generateA11yId, A11yAnnouncer } from '@/utils/accessibility';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  /** Screen reader text for icon-only buttons */
  ariaLabel?: string;
  /** Additional description for complex actions */
  ariaDescription?: string;
  /** Live region announcement when action completes */
  announceOnClick?: string;
  /** Tooltip text for additional context */
  tooltip?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ariaLabel,
    ariaDescription,
    announceOnClick,
    tooltip,
    onClick,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;
    const buttonId = React.useId();
    const descriptionId = ariaDescription ? generateA11yId('button-desc') : undefined;
    const tooltipId = tooltip ? generateA11yId('button-tooltip') : undefined;

    // Enhanced click handler with accessibility announcements
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick && !isDisabled) {
        onClick(event);

        // Announce action completion for screen readers
        if (announceOnClick && !event.defaultPrevented) {
          const announcer = A11yAnnouncer.getInstance();
          announcer.announce(announceOnClick);
        }
      }
    }, [onClick, announceOnClick, isDisabled]);

    // Keyboard event handler for accessibility
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Ensure Space and Enter trigger onClick
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (!isDisabled) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
          });
          event.currentTarget.dispatchEvent(clickEvent);
        }
      }
    }, [isDisabled]);

    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative";
    
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-opacity-50",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 focus:ring-opacity-50",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-opacity-50",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 focus:ring-opacity-50",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 focus:ring-opacity-50",
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm min-h-[32px]",
      md: "px-4 py-2 text-sm min-h-[40px]",
      lg: "px-6 py-3 text-base min-h-[48px]",
    };

    // Build aria-describedby attribute
    const ariaDescribedBy = [descriptionId, tooltipId].filter(Boolean).join(' ') || undefined;

    return (
      <>
        <button
          ref={ref}
          id={buttonId}
          className={clsx(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-busy={isLoading}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          title={tooltip}
          {...props}
        >
          {isLoading && (
            <>
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
                aria-label="Loading"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </>
          )}
          {!isLoading && leftIcon && (
            <span className="mr-2" aria-hidden="true">{leftIcon}</span>
          )}
          {children}
          {!isLoading && rightIcon && (
            <span className="ml-2" aria-hidden="true">{rightIcon}</span>
          )}
        </button>
        
        {/* Hidden description for screen readers */}
        {ariaDescription && (
          <div id={descriptionId} className="sr-only">
            {ariaDescription}
          </div>
        )}
        
        {/* Hidden tooltip description for screen readers */}
        {tooltip && (
          <div id={tooltipId} className="sr-only">
            {tooltip}
          </div>
        )}
      </>
    );
  }
);

Button.displayName = 'Button';

export default Button;