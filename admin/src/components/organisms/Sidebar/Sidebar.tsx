/**
 * Sidebar Organism Component
 * Main navigation sidebar with collapsible sections and active states
 */

import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { shallowEqual } from '@/utils/performance';
import { Icon, Badge, Text } from '@/components/atoms';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';

export interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggleCollapse?: () => void;
  onMobileToggle?: () => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  badge?: string;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  children?: MenuItem[];
  permission?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onMobileToggle,
  className = '',
}) => {
  const { user, hasPermission } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['users']));
  const [searchQuery] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);

  // Navigation menu items
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'HomeIcon',
      path: ROUTES.DASHBOARD,
    },
    {
      id: 'users',
      label: 'User Management',
      icon: 'UsersIcon',
      permission: 'users.view',
      children: [
        { id: 'users-list', label: 'All Users', icon: 'UserGroupIcon', path: ROUTES.USERS, permission: 'users.view' },
        { id: 'users-create', label: 'Add User', icon: 'UserPlusIcon', path: '/users/create', permission: 'users.create' },
        { id: 'users-roles', label: 'Roles & Permissions', icon: 'ShieldCheckIcon', path: '/users/roles', permission: 'system.users' },
      ],
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: 'CalendarDaysIcon',
      permission: 'bookings.view',
      badge: '12',
      badgeVariant: 'primary',
      children: [
        { id: 'bookings-list', label: 'All Bookings', icon: 'ListBulletIcon', path: ROUTES.BOOKINGS },
        { id: 'bookings-calendar', label: 'Calendar View', icon: 'CalendarIcon', path: '/bookings/calendar' },
        { id: 'bookings-pending', label: 'Pending Approval', icon: 'ClockIcon', path: '/bookings/pending', badge: '5', badgeVariant: 'warning' },
      ],
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: 'CreditCardIcon',
      permission: 'payments.view',
      children: [
        { id: 'payments-list', label: 'All Payments', icon: 'BanknotesIcon', path: '/payments' },
        { id: 'payments-refunds', label: 'Refunds', icon: 'ArrowUturnLeftIcon', path: '/payments/refunds' },
        { id: 'payments-reports', label: 'Financial Reports', icon: 'ChartBarIcon', path: '/payments/reports' },
      ],
    },
    {
      id: 'reviews',
      label: 'Reviews & Ratings',
      icon: 'StarIcon',
      permission: 'reviews.view',
      children: [
        { id: 'reviews-list', label: 'All Reviews', icon: 'ChatBubbleLeftRightIcon', path: '/reviews' },
        { id: 'reviews-flagged', label: 'Flagged Reviews', icon: 'ExclamationTriangleIcon', path: '/reviews/flagged', badge: '3', badgeVariant: 'error' },
        { id: 'reviews-analytics', label: 'Analytics', icon: 'ChartBarIcon', path: '/reviews/analytics' },
      ],
    },
    {
      id: 'artist-verification',
      label: 'Artist Verification',
      icon: 'ShieldCheckIcon',
      permission: 'artist_verification.view',
      children: [
        { id: 'verification-queue', label: 'Verification Queue', icon: 'ClockIcon', path: '/artist-verification', badge: '8', badgeVariant: 'warning' },
        { id: 'portfolio-moderation', label: 'Portfolio Moderation', icon: 'PhotoIcon', path: '/artist-verification/portfolio', badge: '15', badgeVariant: 'info' },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      icon: 'WrenchScrewdriverIcon',
      children: [
        { id: 'services-list', label: 'All Services', icon: 'ListBulletIcon', path: '/services' },
        { id: 'services-categories', label: 'Categories', icon: 'TagIcon', path: '/services/categories' },
        { id: 'services-providers', label: 'Providers', icon: 'BuildingStorefrontIcon', path: '/services/providers' },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'ChartBarIcon',
      permission: 'analytics.view',
      children: [
        { id: 'analytics-overview', label: 'Overview', icon: 'PresentationChartBarIcon', path: '/analytics' },
        { id: 'analytics-revenue', label: 'Revenue', icon: 'CurrencyDollarIcon', path: '/analytics/revenue' },
        { id: 'analytics-users', label: 'User Analytics', icon: 'UsersIcon', path: '/analytics/users' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'CogIcon',
      permission: 'system.settings',
      children: [
        { id: 'settings-general', label: 'General', icon: 'AdjustmentsHorizontalIcon', path: ROUTES.SETTINGS },
        { id: 'settings-security', label: 'Security', icon: 'LockClosedIcon', path: '/settings/security' },
        { id: 'settings-integrations', label: 'Integrations', icon: 'LinkIcon', path: '/settings/integrations' },
      ],
    },
  ];

  // Filter menu items based on permissions - memoized to prevent infinite re-renders
  const visibleMenuItems = useMemo(() => {
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => !item.permission || hasPermission(item.permission))
        .map(item => ({
          ...item,
          children: item.children ? filterMenuItems(item.children) : undefined,
        }));
    };
    return filterMenuItems(menuItems);
  }, [hasPermission]);

  // Search functionality - memoized to prevent infinite re-renders
  const searchMenuItems = useCallback((items: MenuItem[], query: string): MenuItem[] => {
    if (!query.trim()) return items;
    
    const searchTerm = query.toLowerCase();
    
    const searchItems = (itemList: MenuItem[]): MenuItem[] => {
      return itemList.reduce((acc: MenuItem[], item) => {
        const matchesLabel = item.label.toLowerCase().includes(searchTerm);
        const filteredChildren = item.children ? searchItems(item.children) : undefined;
        
        if (matchesLabel || (filteredChildren && filteredChildren.length > 0)) {
          acc.push({
            ...item,
            children: filteredChildren || item.children,
          });
        }
        
        return acc;
      }, []);
    };

    return searchItems(items);
  }, []);

  // Update filtered items when search query changes
  useEffect(() => {
    const updateFilteredItems = () => {
      if (searchQuery.trim()) {
        const filtered = searchMenuItems(visibleMenuItems, searchQuery);
        setFilteredMenuItems(filtered);
        
        // Auto-expand items when searching
        const expandAll = (items: MenuItem[]): Set<string> => {
          const expanded = new Set<string>();
          items.forEach(item => {
            if (item.children) {
              expanded.add(item.id);
              const childExpanded = expandAll(item.children);
              childExpanded.forEach(id => expanded.add(id));
            }
          });
          return expanded;
        };
        setExpandedItems(expandAll(filtered));
      } else {
        setFilteredMenuItems(visibleMenuItems);
      }
    };

    updateFilteredItems();
  }, [searchQuery, visibleMenuItems, searchMenuItems]);

  // Toggle expanded state
  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Render menu item with modern styling
  const renderMenuItem = useCallback((item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isParent = hasChildren;
    const paddingLeft = collapsed ? 'pl-3' : level === 0 ? 'pl-3' : 'pl-7';

    return (
      <div key={item.id} className="w-full">
        {/* Main item */}
        <div className={`group ${paddingLeft}`}>
          {item.path && !isParent ? (
            <a
              href={item.path}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                text-slate-700 hover:text-slate-900 hover:bg-slate-100
                active:bg-slate-200 active:scale-95
                ${collapsed ? 'justify-center px-2' : 'justify-start'}
                group-hover:shadow-sm
              `}
            >
              <Icon name={item.icon as any} size="sm" className="flex-shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || 'primary'} 
                      size="sm"
                      className="animate-pulse"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => isParent && toggleExpanded(item.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                text-slate-700 hover:text-slate-900 hover:bg-slate-100
                active:bg-slate-200 active:scale-95
                ${collapsed ? 'justify-center px-2' : 'justify-start'}
                group-hover:shadow-sm
              `}
            >
              <Icon name={item.icon as any} size="sm" className="flex-shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge 
                        variant={item.badgeVariant || 'primary'} 
                        size="sm"
                        className="animate-pulse"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {isParent && (
                      <div className="transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <Icon
                          name="ChevronDownIcon"
                          size="xs"
                          className="text-slate-400"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </button>
          )}
        </div>

        {/* Children with animation */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [collapsed, expandedItems, toggleExpanded]);

  return (
    <aside 
      data-sidebar="true"
      className={`
        fixed top-16 left-0 bottom-0 z-50 bg-white border-r border-slate-200 transition-all duration-300
        lg:translate-x-0 lg:static lg:top-0
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:border-none">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Maya
              </span>
            </div>
          )}
          
          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:block p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon 
                name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} 
                size="sm" 
                className="text-slate-500" 
              />
            </button>
          )}

          {/* Mobile close button */}
          {onMobileToggle && (
            <button
              type="button"
              onClick={onMobileToggle}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <Icon name="XMarkIcon" size="sm" className="text-slate-500" />
            </button>
          )}
        </div>

        {/* Search Input (when not collapsed) */}
        {/* {!collapsed && (
          <div className="px-4 pb-4 border-b border-slate-200">
            <div className="relative">
              <Icon 
                name="MagnifyingGlassIcon" 
                size="sm" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
              />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Icon name="XMarkIcon" size="xs" />
                </button>
              )}
            </div>
          </div>
        )} */}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {(searchQuery ? filteredMenuItems : visibleMenuItems).map((item: MenuItem) => renderMenuItem(item))}
          
          {searchQuery && filteredMenuItems.length === 0 && (
            <div className="text-center py-8">
              <Icon name="MagnifyingGlassIcon" size="lg" className="mx-auto text-slate-300 mb-3" />
              <Text variant="body" className="text-slate-500 mb-1">No results found</Text>
              <Text variant="caption" className="text-slate-400">
                Try searching for something else
              </Text>
            </div>
          )}
        </nav>

        {/* Footer with enhanced styling */}
        <div className="p-4 border-t border-slate-200">
          {!collapsed && user && (
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm">
                {user.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.role ? user.role.replace('_', ' ') : 'User'}
                </p>
              </div>
            </div>
          )}
          
          {collapsed && user && (
            <div className="flex justify-center">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm">
                {user.full_name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

// Memoize for performance
const MemoizedSidebar = memo(Sidebar, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedSidebar.displayName = 'Sidebar';

export default MemoizedSidebar;