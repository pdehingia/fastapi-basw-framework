/**
 * Link Atom Component
 * Navigation links with TanStack Router integration and accessibility
 */

import { memo, forwardRef } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from '@tanstack/react-router';
import { shallowEqual } from '@/utils/performance';
import { Icon, type IconName } from '@/components/atoms/Icon';

export interface LinkProps extends Omit<RouterLinkProps, 'className'> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'muted';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  underline?: 'none' | 'hover' | 'always';
  external?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  className?: string;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({
    variant = 'default',
    size = 'md',
    underline = 'hover',
    external = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    className = '',
    children,
    ...props
  }, ref) => {
    // Size mappings
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    // Variant mappings
    const variantClasses = {
      default: 'text-blue-600 hover:text-blue-800 visited:text-purple-600',
      primary: 'text-blue-600 hover:text-blue-800 focus:text-blue-800',
      secondary: 'text-gray-600 hover:text-gray-800 focus:text-gray-800',
      danger: 'text-red-600 hover:text-red-800 focus:text-red-800',
      muted: 'text-gray-500 hover:text-gray-700 focus:text-gray-700',
    };

    // Underline mappings
    const underlineClasses = {
      none: 'no-underline',
      hover: 'no-underline hover:underline',
      always: 'underline',
    };

    // Icon size mapping
    const iconSizeMap = {
      xs: 'xs' as const,
      sm: 'xs' as const,
      md: 'sm' as const,
      lg: 'md' as const,
    };

    // Base classes
    const baseClasses = `
      inline-flex items-center gap-1 font-medium transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-sm
      ${sizeClasses[size]}
      ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : variantClasses[variant]}
      ${underlineClasses[underline]}
      ${className}
    `.trim();

    // External link props
    const externalProps = external
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

    // Render icon
    const renderIcon = () => {
      if (!icon) return null;
      
      return (
        <Icon
          name={icon}
          size={iconSizeMap[size]}
          className={iconPosition === 'right' ? 'order-2' : 'order-1'}
        />
      );
    };

    // Render children with proper ordering
    const renderContent = () => {
      const iconElement = renderIcon();
      
      // Handle function children for router link
      if (typeof children === 'function') {
        return (state: { isActive: boolean; isTransitioning: boolean }) => {
          const textElement = (
            <span className={iconPosition === 'right' ? 'order-1' : 'order-2'}>
              {children(state)}
            </span>
          );

          return (
            <>
              {iconElement}
              {textElement}
              {external && !icon && (
                <Icon
                  name="ArrowTopRightOnSquareIcon"
                  size="xs"
                  className="order-3 opacity-70"
                />
              )}
            </>
          );
        };
      }

      // Handle static children
      const textElement = (
        <span className={iconPosition === 'right' ? 'order-1' : 'order-2'}>
          {children}
        </span>
      );

      return (
        <>
          {iconElement}
          {textElement}
          {external && !icon && (
            <Icon
              name="ArrowTopRightOnSquareIcon"
              size="xs"
              className="order-3 opacity-70"
            />
          )}
        </>
      );
    };

    // External link
    if (external && typeof props.to === 'string' && (props.to.startsWith('http') || props.to.startsWith('mailto:'))) {
      const content = renderContent();
      
      return (
        <a
          ref={ref}
          href={props.to}
          className={baseClasses}
          aria-disabled={disabled}
          {...externalProps}
        >
          {typeof content === 'function' ? content({ isActive: false, isTransitioning: false }) : content}
        </a>
      );
    }

    // Internal router link
    return (
      <RouterLink
        ref={ref}
        className={baseClasses}
        aria-disabled={disabled}
        {...props}
      >
        {renderContent()}
      </RouterLink>
    );
  }
);

// Memoize for performance
const MemoizedLink = memo(Link, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedLink.displayName = 'Link';

export default MemoizedLink;