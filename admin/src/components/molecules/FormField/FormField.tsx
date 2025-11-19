/**
 * FormField Molecule Component
 * Reusable form field with validation, error display, and various input types
 */

import React, { forwardRef, memo, useCallback } from 'react';
import { shallowEqual } from '@/utils/performance';

export interface FormFieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  value?: string | number | boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  rows?: number; // For textarea
  multiple?: boolean; // For select and file
  accept?: string; // For file input
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  step?: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outline';
  icon?: {
    left?: React.ReactNode;
    right?: React.ReactNode;
  };
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validation?: {
    validate?: (value: any) => string | undefined;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  };
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  label,
  name,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  helpText,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  autoComplete,
  className = '',
  inputClassName = '',
  labelClassName = '',
  options = [],
  rows = 4,
  multiple = false,
  accept,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  step,
  size = 'medium',
  variant = 'default',
  icon,
  onChange,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  validation,
}, ref) => {
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-4 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    default: 'border border-gray-300 bg-white',
    filled: 'border border-gray-300 bg-gray-50',
    outline: 'border-2 border-gray-300 bg-transparent',
  };

  // Base input classes
  const baseInputClasses = `
    w-full rounded-md shadow-sm transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${icon?.left ? 'pl-10' : ''}
    ${icon?.right ? 'pr-10' : ''}
    ${inputClassName}
  `.trim();

  // Handle validation - memoized to prevent unnecessary re-renders
  const handleValidation = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (validation?.validate && validation.validateOnBlur) {
      const validationError = validation.validate(event.target.value);
      if (validationError && onBlur) {
        // You would typically handle this through a form library or state management
        console.warn('Validation error:', validationError);
      }
    }
    onBlur?.(event);
  }, [validation, onBlur]);

  // Render input based on type
  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      required,
      disabled,
      readOnly,
      autoFocus,
      autoComplete,
      placeholder,
      onChange,
      onBlur: handleValidation,
      onFocus,
      onClick,
      onKeyDown,
      className: baseInputClasses,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${name}-error` : helpText ? `${name}-help` : undefined,
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...commonProps}
            value={value as string}
            defaultValue={defaultValue as string}
            rows={rows}
            minLength={minLength}
            maxLength={maxLength}
          />
        );

      case 'select':
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            {...commonProps}
            value={value as string | number}
            defaultValue={defaultValue as string | number}
            multiple={multiple}
          >
            {placeholder && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="checkbox"
            {...commonProps}
            checked={value as boolean}
            defaultChecked={defaultValue as boolean}
            className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${inputClassName}`}
          />
        );

      case 'radio':
        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="radio"
            {...commonProps}
            checked={value as boolean}
            defaultChecked={defaultValue as boolean}
            className={`border-gray-300 text-blue-600 focus:ring-blue-500 ${inputClassName}`}
          />
        );

      case 'file':
        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="file"
            {...commonProps}
            multiple={multiple}
            accept={accept}
            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${inputClassName}`}
          />
        );

      default:
        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            {...commonProps}
            value={value as string | number}
            defaultValue={defaultValue as string | number}
            min={min}
            max={max}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            step={step}
          />
        );
    }
  };

  return (
    <div className={`form-field ${className}`}>
      {/* Label */}
      {label && type !== 'checkbox' && type !== 'radio' && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container with icons */}
      <div className="relative">
        {icon?.left && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon.left}</span>
          </div>
        )}

        {/* Checkbox/Radio with label */}
        {(type === 'checkbox' || type === 'radio') && label ? (
          <label className={`flex items-center ${labelClassName}`}>
            {renderInput()}
            <span className="ml-2 text-sm text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        ) : (
          renderInput()
        )}

        {icon?.right && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon.right}</span>
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && !error && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// Memoize the FormField component for better performance
const MemoizedFormField = memo(FormField, (prevProps, nextProps) => {
  // Custom comparison to handle ref changes properly
  const { ref: prevRef, ...prevRest } = prevProps as any;
  const { ref: nextRef, ...nextRest } = nextProps as any;
  
  return shallowEqual(prevRest, nextRest);
});

MemoizedFormField.displayName = 'FormField';

export default MemoizedFormField;