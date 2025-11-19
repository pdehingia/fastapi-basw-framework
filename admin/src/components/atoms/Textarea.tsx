import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error = false, 
    helperText, 
    label, 
    resize = 'vertical',
    ...props 
  }, ref) => {
    const textareaId = React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            // Base styles
            "w-full px-3 py-2 text-sm",
            "border border-gray-300 rounded-md shadow-sm",
            "placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "transition-colors duration-200",
            
            // Resize behavior
            {
              'resize-none': resize === 'none',
              'resize': resize === 'both',
              'resize-x': resize === 'horizontal',
              'resize-y': resize === 'vertical',
            },
            
            // Error styles
            error && [
              "border-red-300",
              "focus:ring-red-500 focus:border-red-500",
              "placeholder-red-300"
            ],
            
            className
          )}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-red-600" : "text-gray-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;