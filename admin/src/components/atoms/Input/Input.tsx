/**
 * Input atom component
 * Accessible input component with WCAG 2.1 AA compliance
 */

import React, { useState } from 'react';
import { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { generateA11yId } from '@/utils/accessibility';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  /** Hide label visually but keep it accessible to screen readers */
  hideLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    id, 
    type,
    showPasswordToggle = false,
    hideLabel = false,
    leftIcon,
    rightIcon,
    required,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || generateA11yId('input');
    const errorId = error ? generateA11yId('input-error') : undefined;
    const helperTextId = helperText ? generateA11yId('input-helper') : undefined;
    
    // Determine actual input type
    const actualType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type;

    // Build describedBy relationship
    const describedByIds = [
      ariaDescribedBy,
      helperTextId,
      errorId,
    ].filter(Boolean).join(' ') || undefined;
    
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const errorClasses = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
    
    const paddingClasses = clsx({
      'pl-10': leftIcon,
      'pr-10': rightIcon || showPasswordToggle,
    });

    const labelClasses = clsx(
      "block text-sm font-medium text-gray-700 mb-1",
      {
        'sr-only': hideLabel,
      }
    );

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const passwordToggleLabel = showPassword ? 'Hide password' : 'Show password';

    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={inputId}
            className={labelClasses}
          >
            {label}
            {required && (
              <span 
                className="text-red-500 ml-1" 
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}
        
        {helperText && !error && (
          <div 
            id={helperTextId}
            className="text-sm text-gray-500"
          >
            {helperText}
          </div>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={clsx(
              baseClasses, 
              errorClasses, 
              paddingClasses,
              className
            )}
            aria-describedby={describedByIds}
            aria-required={required}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          
          {rightIcon && !showPasswordToggle && (
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-md"
              onClick={togglePasswordVisibility}
              aria-label={passwordToggleLabel}
              title={passwordToggleLabel}
            >
              {showPassword ? (
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a9.969 9.969 0 00-5.464 8.536M9.878 9.878a3 3 0 014.243 4.243m4.242 4.242L21.536 16.5a9.969 9.969 0 01-5.464 3.464" />
                </svg>
              ) : (
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        {error && (
          <div 
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;