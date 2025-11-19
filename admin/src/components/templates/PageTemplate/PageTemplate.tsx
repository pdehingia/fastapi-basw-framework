/**
 * PageTemplate Component
 * Standardized page template for all protected routes with consistent layouts,
 * loading states, error boundaries, and content patterns
 */

import { memo, useState, ReactNode } from 'react';
import { shallowEqual } from '@/utils/performance';
import { Button, Heading, Text, Icon } from '@/components/atoms';
import { Card, CardBody } from '@/components/molecules';
import type { BreadcrumbItem, ActionButton } from '@/components/organisms/NavigationMenu/NavigationMenu';

export interface PageTemplateProps {
  // Page metadata
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  
  // Page actions
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  
  // Layout options
  layout?: 'default' | 'wide' | 'narrow' | 'full';
  showBackButton?: boolean;
  onBack?: () => void;
  
  // State management
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: string;
    action?: ActionButton;
  };
  
  // Content
  children: ReactNode;
  headerActions?: ReactNode;
  
  // Styling
  className?: string;
  contentClassName?: string;
}

const PageTemplate: React.FC<PageTemplateProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryActions = [],
  layout = 'default',
  showBackButton = false,
  onBack,
  loading = false,
  error = null,
  empty = false,
  emptyState,
  children,
  headerActions,
  className = '',
  contentClassName = '',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  // Handle retry action for error state
  const handleRetry = async () => {
    setIsRetrying(true);
    // Add retry logic here if needed
    setTimeout(() => setIsRetrying(false), 1000);
  };

  // Layout width classes
  const layoutClasses = {
    default: 'max-w-7xl mx-auto',
    wide: 'max-w-screen-2xl mx-auto',
    narrow: 'max-w-4xl mx-auto',
    full: 'w-full',
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${layoutClasses[layout]} px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${layoutClasses[layout]} px-4 sm:px-6 lg:px-8 ${className}`}>
        <Card className="text-center py-12">
          <CardBody>
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Icon name="ExclamationTriangleIcon" size="lg" className="text-red-600" />
            </div>
            <Heading as="h2" size="lg" className="text-slate-900 mb-2">
              Something went wrong
            </Heading>
            <Text color="muted" className="mb-6 max-w-sm mx-auto">
              {error}
            </Text>
            <div className="flex justify-center space-x-3">
              <Button
                variant="primary"
                onClick={handleRetry}
                isLoading={isRetrying}
              >
                Try Again
              </Button>
              <Button variant="ghost" onClick={onBack}>
                Go Back
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Empty state
  if (empty) {
    const emptyConfig = {
      title: 'No data found',
      description: 'There are no items to display at the moment.',
      icon: 'FolderIcon',
      ...emptyState,
    };

    return (
      <div className={`${layoutClasses[layout]} px-4 sm:px-6 lg:px-8 ${className}`}>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="mr-2"
                  >
                    Back
                  </Button>
                )}
                <Heading as="h1" size="2xl" className="text-slate-900">
                  {title}
                </Heading>
              </div>
              {subtitle && (
                <Text color="muted" className="mt-1">
                  {subtitle}
                </Text>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {headerActions}
              {secondaryActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={action.onClick}
                  leftIcon={action.icon}
                  isLoading={action.loading}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'primary'}
                  onClick={primaryAction.onClick}
                  leftIcon={primaryAction.icon}
                  isLoading={primaryAction.loading}
                  disabled={primaryAction.disabled}
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        <Card className="text-center py-16">
          <CardBody>
            <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <Icon name={emptyConfig.icon as any} size="xl" className="text-slate-400" />
            </div>
            <Heading as="h2" size="lg" className="text-slate-900 mb-2">
              {emptyConfig.title}
            </Heading>
            <Text color="muted" className="mb-8 max-w-sm mx-auto">
              {emptyConfig.description}
            </Text>
            {emptyConfig.action && (
              <Button
                variant={emptyConfig.action.variant || 'primary'}
                onClick={emptyConfig.action.onClick}
                leftIcon={emptyConfig.action.icon}
              >
                {emptyConfig.action.label}
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className={`${layoutClasses[layout]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  leftIcon="ArrowLeftIcon"
                  className="mr-2"
                >
                  Back
                </Button>
              )}
              <div>
                <Heading as="h1" size="2xl" className="text-slate-900">
                  {title}
                </Heading>
                {subtitle && (
                  <Text color="muted" className="mt-1 text-lg">
                    {subtitle}
                  </Text>
                )}
                {description && (
                  <Text color="muted" className="mt-2 max-w-2xl">
                    {description}
                  </Text>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-6 flex-shrink-0">
            {headerActions}
            {secondaryActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'secondary'}
                size="sm"
                onClick={action.onClick}
                leftIcon={action.icon}
                isLoading={action.loading}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
            {primaryAction && (
              <Button
                variant={primaryAction.variant || 'primary'}
                onClick={primaryAction.onClick}
                leftIcon={primaryAction.icon}
                isLoading={primaryAction.loading}
                disabled={primaryAction.disabled}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

// Memoize for performance
const MemoizedPageTemplate = memo(PageTemplate, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedPageTemplate.displayName = 'PageTemplate';

export default MemoizedPageTemplate;