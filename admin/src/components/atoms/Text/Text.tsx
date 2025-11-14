/**
 * Typography atoms - Text component
 * Flexible text component with various styles
 */

import React from 'react';
import { clsx } from 'clsx';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'label';
  variant?: 'body' | 'caption' | 'small' | 'lead';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'success' | 'warning' | 'error' | 'primary';
  children: React.ReactNode;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    as = 'p', 
    variant = 'body', 
    weight = 'normal', 
    color = 'default', 
    className, 
    children, 
    ...props 
  }, ref) => {
    const Component = as;
    
    const baseClasses = "leading-relaxed";
    
    const variantClasses = {
      body: "text-base",
      lead: "text-lg",
      caption: "text-sm",
      small: "text-xs",
    };
    
    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };
    
    const colorClasses = {
      default: "text-gray-900",
      muted: "text-gray-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      primary: "text-blue-600",
    };

    return (
      <Component
        ref={ref as any}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          weightClasses[weight],
          colorClasses[color],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export default Text;