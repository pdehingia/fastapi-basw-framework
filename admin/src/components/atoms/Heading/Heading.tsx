/**
 * Typography atoms - Heading component
 * Semantic heading component with consistent styling
 */

import React from 'react';
import { clsx } from 'clsx';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary';
  children: React.ReactNode;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    as = 'h2', 
    size = 'md', 
    weight = 'semibold', 
    color = 'default', 
    className, 
    children, 
    ...props 
  }, ref) => {
    const Component = as;
    
    const baseClasses = "leading-tight tracking-tight";
    
    const sizeClasses = {
      xs: "text-xs",
      sm: "text-sm", 
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      '2xl': "text-2xl",
      '3xl': "text-3xl",
      '4xl': "text-4xl",
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
      primary: "text-blue-600",
    };

    return (
      <Component
        ref={ref}
        className={clsx(
          baseClasses,
          sizeClasses[size],
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

Heading.displayName = 'Heading';

export default Heading;