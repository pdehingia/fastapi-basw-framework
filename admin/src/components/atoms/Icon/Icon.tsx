/**
 * Icon Atom Component
 * Heroicons integration with size variants and accessibility
 */

import React, { memo } from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { shallowEqual } from '@/utils/performance';

type HeroIconName = keyof typeof HeroIcons;
type HeroIconSolidName = keyof typeof HeroIconsSolid;

export type IconName = HeroIconName | HeroIconSolidName;

export interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'outline' | 'solid';
  className?: string;
  color?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  onClick?: () => void;
  role?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  variant = 'outline',
  className = '',
  color,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  onClick,
  role,
}) => {
  // Size mapping
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  // Get the correct icon component
  const iconLibrary = variant === 'solid' ? HeroIconsSolid : HeroIcons;
  const IconComponent = iconLibrary[name as keyof typeof iconLibrary];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in ${variant} variant`);
    return null;
  }

  const baseClasses = `${sizeClasses[size]} ${className}`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';

  return (
    <IconComponent
      className={`${baseClasses} ${interactiveClasses}`.trim()}
      style={color ? { color } : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      onClick={onClick}
      role={role || (onClick ? 'button' : undefined)}
    />
  );
};

// Memoize for performance
const MemoizedIcon = memo(Icon, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedIcon.displayName = 'Icon';

export { MemoizedIcon as Icon };
export default MemoizedIcon;