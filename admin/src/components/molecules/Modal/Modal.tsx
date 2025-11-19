/**
 * Modal Molecule Component
 * Reusable modal with focus management, escape key handling, and accessibility
 */

import React, { useEffect, useRef, useCallback, memo } from 'react';
import { UI_MESSAGES } from '@/constants/messages';
import { shallowEqual } from '@/utils/performance';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  preventScroll?: boolean;
  footer?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    loading?: boolean;
  }>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  preventScroll = true,
  footer,
  actions,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes mapping
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
  };

  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (closeOnEscapeKey && event.key === 'Escape') {
      onClose();
    }
  }, [closeOnEscapeKey, onClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Prevent body scroll
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }

      // Add escape key listener
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        // Restore focus to previous element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }

        // Restore body scroll
        if (preventScroll) {
          document.body.style.overflow = '';
        }

        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleEscapeKey, preventScroll]);

  // Trap focus within modal
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full ${sizeClasses[size]} ${className}`}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3 id="modal-title" className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={UI_MESSAGES.ACTIONS.CANCEL}
                >
                  <span className="sr-only">{UI_MESSAGES.ACTIONS.CANCEL}</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {(footer || actions) && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              {footer || (
                actions && actions.map((action, index) => {
                  const baseClasses = "inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
                  
                  const variantClasses = {
                    primary: "border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400",
                    secondary: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
                    danger: "border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400",
                  };

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                      className={`${baseClasses} ${variantClasses[action.variant || 'secondary']} ${
                        action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {action.loading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {action.label}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize the Modal component for performance
const MemoizedModal = memo(Modal, (prevProps, nextProps) => {
  // Don't re-render if only isOpen changes from false to false
  if (!prevProps.isOpen && !nextProps.isOpen) {
    return true;
  }
  
  // Use shallow comparison for other cases
  return shallowEqual(prevProps, nextProps);
});

MemoizedModal.displayName = 'Modal';

export default MemoizedModal;