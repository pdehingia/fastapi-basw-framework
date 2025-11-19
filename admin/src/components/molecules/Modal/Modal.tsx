/**
 * Modal Molecule Component
 * Accessible modal with WCAG 2.1 AA compliance, focus management, and keyboard navigation
 */

import React, { useEffect, useRef, useCallback, memo } from 'react';
import { UI_MESSAGES } from '@/constants/messages';
import { shallowEqual } from '@/utils/performance';
import { KeyboardNavigation, FocusManager, A11yAnnouncer } from '@/utils/accessibility';

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
  /** Additional ARIA description for screen readers */
  ariaDescription?: string;
  /** Announcement for screen readers when modal opens */
  openAnnouncement?: string;
  /** Announcement for screen readers when modal closes */
  closeAnnouncement?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    loading?: boolean;
    ariaLabel?: string;
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
  ariaDescription,
  openAnnouncement,
  closeAnnouncement,
  actions,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const focusTrapCleanup = useRef<(() => void) | null>(null);
  const modalId = React.useId();
  const titleId = title ? `${modalId}-title` : undefined;
  const descriptionId = ariaDescription ? `${modalId}-description` : undefined;

  // Size classes mapping
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
  };

  // Enhanced close handler with announcements
  const handleClose = useCallback(() => {
    if (closeAnnouncement) {
      const announcer = A11yAnnouncer.getInstance();
      announcer.announce(closeAnnouncement);
    }
    onClose();
  }, [onClose, closeAnnouncement]);

  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (closeOnEscapeKey && event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }
  }, [closeOnEscapeKey, handleClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      handleClose();
    }
  }, [closeOnOverlayClick, handleClose]);

  // Focus management and announcements
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Announce modal opening
      if (openAnnouncement) {
        const announcer = A11yAnnouncer.getInstance();
        announcer.announce(openAnnouncement, 'assertive');
      }

      // Set up focus trap
      if (modalRef.current) {
        focusTrapCleanup.current = KeyboardNavigation.trapFocus(modalRef.current);
      }

      // Prevent body scroll and hide content from screen readers
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
      
      // Hide main content from screen readers
      const mainContent = document.querySelector('main') || document.body.children[0];
      if (mainContent && mainContent !== modalRef.current?.closest('.modal-root')) {
        (mainContent as HTMLElement).setAttribute('aria-hidden', 'true');
      }

      // Add escape key listener
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        // Clean up focus trap
        if (focusTrapCleanup.current) {
          focusTrapCleanup.current();
          focusTrapCleanup.current = null;
        }

        // Restore focus to previous element
        if (previousActiveElement.current) {
          setTimeout(() => {
            previousActiveElement.current?.focus();
          }, 0);
        }

        // Restore body scroll
        if (preventScroll) {
          document.body.style.overflow = '';
        }

        // Restore main content visibility to screen readers
        const mainContent = document.querySelector('main') || document.body.children[0];
        if (mainContent) {
          (mainContent as HTMLElement).removeAttribute('aria-hidden');
        }

        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleEscapeKey, preventScroll, openAnnouncement]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto modal-root ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full ${sizeClasses[size]} ${className}`}
          tabIndex={-1}
        >
          {/* Hidden description for screen readers */}
          {ariaDescription && (
            <div id={descriptionId} className="sr-only">
              {ariaDescription}
            </div>
          )}

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3 id={titleId} className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-2"
                  aria-label={`Close ${title || 'modal'}`}
                >
                  <svg 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
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
                  const baseClasses = "inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
                  
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
                      aria-label={action.ariaLabel || action.label}
                      aria-busy={action.loading}
                      className={`${baseClasses} ${variantClasses[action.variant || 'secondary']}`}
                    >
                      {action.loading && (
                        <>
                          <svg 
                            className="animate-spin -ml-1 mr-2 h-4 w-4" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </>
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