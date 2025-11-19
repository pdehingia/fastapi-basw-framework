/**
 * NavigationMenu Organism Component
 * Top navigation menu with breadcrumbs, actions, and context-aware navigation
 */

import { memo, useState, useCallback } from 'react';
import { shallowEqual } from '@/utils/performance';
import { Icon, Button, Text } from '@/components/atoms';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  current?: boolean;
}

export interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  permissions?: string[];
}

export interface NavigationMenuProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ActionButton[];
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  title,
  breadcrumbs = [],
  actions = [],
  showBackButton = false,
  onBack,
  className = '',
}) => {
  const [actionsOpen, setActionsOpen] = useState(false);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((item: BreadcrumbItem) => {
    if (item.href && !item.current) {
      // In a real app, this would use react-router
      window.location.href = item.href;
    }
  }, []);

  // Handle back button
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }, [onBack]);

  // Filter actions by permissions (placeholder implementation)
  const visibleActions = actions.filter(() => {
    // In a real app, check user permissions here
    return true;
  });

  return (
    <nav className={`bg-white border-b border-slate-200 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - Back button, Title, Breadcrumbs */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            {/* Back button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                aria-label="Go back"
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <Icon name="ArrowLeftIcon" size="sm" />
              </Button>
            )}

            {/* Title and Breadcrumbs */}
            <div className="min-w-0 flex-1">
              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <nav className="flex mb-2" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    {breadcrumbs.map((item, index) => (
                      <li key={item.id} className="flex items-center">
                        {index > 0 && (
                          <Icon 
                            name="ChevronRightIcon" 
                            size="xs" 
                            className="text-slate-400 mx-2"
                          />
                        )}
                        
                        {item.current ? (
                          <Text variant="small" className="font-medium text-slate-600">
                            {item.label}
                          </Text>
                        ) : (
                          <button
                            onClick={() => handleBreadcrumbClick(item)}
                            className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
                          >
                            {item.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Page title */}
              {title && (
                <h1 className="text-2xl font-bold text-slate-900 truncate">
                  {title}
                </h1>
              )}
            </div>
          </div>

          {/* Right section - Actions */}
          {visibleActions.length > 0 && (
            <div className="flex items-center space-x-3 ml-4">
              {/* Primary actions (first 2) */}
              {visibleActions.slice(0, 2).map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || 'primary'}
                  size="sm"
                  onClick={action.onClick}
                  isLoading={action.loading}
                  disabled={action.disabled}
                  className="flex items-center space-x-2 shadow-sm"
                >
                  {action.icon && (
                    <Icon name={action.icon as any} size="sm" />
                  )}
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              ))}

              {/* More actions dropdown */}
              {visibleActions.length > 2 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActionsOpen(!actionsOpen)}
                    aria-expanded={actionsOpen}
                    aria-haspopup="true"
                    className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  >
                    <Icon name="EllipsisVerticalIcon" size="sm" />
                  </Button>

                  {actionsOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActionsOpen(false)}
                      />

                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 overflow-hidden">
                        {visibleActions.slice(2).map((action) => (
                          <button
                            key={action.id}
                            onClick={() => {
                              action.onClick();
                              setActionsOpen(false);
                            }}
                            disabled={action.disabled || action.loading}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 transition-colors"
                          >
                            {action.icon && (
                              <Icon name={action.icon as any} size="sm" className="text-slate-500" />
                            )}
                            <span className="font-medium">{action.label}</span>
                            {action.loading && (
                              <div className="ml-auto">
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Secondary navigation or tabs could go here */}
        {/* This is where you might add tab navigation for different views */}
      </div>
    </nav>
  );
};

// Memoize for performance
const MemoizedNavigationMenu = memo(NavigationMenu, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedNavigationMenu.displayName = 'NavigationMenu';

export default MemoizedNavigationMenu;