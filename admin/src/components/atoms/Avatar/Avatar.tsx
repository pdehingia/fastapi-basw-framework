/**
 * Avatar Atom Component
 * User avatar with fallback letters, status indicators, and size variants
 */

import React, { memo, useState, useCallback } from 'react';
import { shallowEqual } from '@/utils/performance';
import { Icon } from '@/components/atoms/Icon';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  fallbackIcon?: boolean;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  fallbackIcon = false,
  className = '',
  onClick,
  loading = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!src);

  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  // Status colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  // Shape classes
  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  // Get initials from name
  const getInitials = useCallback((fullName?: string): string => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  // Base classes
  const baseClasses = `
    relative inline-flex items-center justify-center
    ${sizeClasses[size]}
    ${shapeClasses}
    font-medium select-none
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim();

  // Loading state
  if (loading || imageLoading) {
    return (
      <div className={`${baseClasses} bg-gray-200 animate-pulse`}>
        <div className="sr-only">Loading avatar...</div>
      </div>
    );
  }

  // Render image if available and not errored
  const shouldShowImage = src && !imageError;

  return (
    <div className={baseClasses} onClick={handleClick} role={onClick ? 'button' : undefined}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt || `${name || 'User'} avatar`}
          className={`w-full h-full object-cover ${shapeClasses}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : fallbackIcon ? (
        <div className="bg-gray-100 w-full h-full flex items-center justify-center">
          <Icon 
            name="UserIcon" 
            size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} 
            className="text-gray-500" 
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-semibold">
          {getInitials(name) || '?'}
        </div>
      )}

      {/* Status indicator */}
      {status && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <div 
            className={`
              ${statusSizes[size]} 
              ${statusColors[status]} 
              ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}
              ring-2 ring-white
            `}
            title={`Status: ${status}`}
            aria-label={`Status: ${status}`}
          />
        </div>
      )}
    </div>
  );
};

// Memoize for performance
const MemoizedAvatar = memo(Avatar, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedAvatar.displayName = 'Avatar';

export default MemoizedAvatar;