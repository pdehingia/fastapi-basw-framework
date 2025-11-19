/**
 * Header Organism Component
 * Top navigation bar with user menu, search, and notifications
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { shallowEqual } from '@/utils/performance';
import { Icon, Avatar } from '@/components/atoms';
import { SearchBox } from '@/components/molecules';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/auth/useAuth';

export interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMobileSidebarToggle?: boolean;
  onMobileSidebarToggle?: () => void;
  isScrolled?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showSearch = true,
  showNotifications = true,
  showMobileSidebarToggle = true,
  onMobileSidebarToggle,
  isScrolled = false,
  className = '',
}) => {
  const { user } = useAuthStore();
  const { logout: logoutWithRedirect } = useLogout();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New booking received', message: 'Customer John Doe booked a service', time: '5 min ago', unread: true },
    { id: 2, title: 'Payment processed', message: 'Payment of $89.99 was successfully processed', time: '1 hour ago', unread: true },
    { id: 3, title: 'Service completed', message: 'Home cleaning service marked as completed', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    console.log('Search query:', query);
    // Implement global search functionality
  }, []);

  // User menu options
  const userMenuOptions = [
    { value: 'profile', label: 'My Profile', icon: 'UserIcon' },
    { value: 'settings', label: 'Settings', icon: 'CogIcon' },
    { value: 'help', label: 'Help & Support', icon: 'QuestionMarkCircleIcon' },
    { value: 'divider', label: '', divider: true },
    { value: 'logout', label: 'Sign Out', icon: 'ArrowRightOnRectangleIcon' },
  ];

  const handleUserMenuSelect = useCallback((value: string) => {
    setShowUserMenu(false);
    
    switch (value) {
      case 'logout':
        logoutWithRedirect();
        break;
      case 'profile':
        // Navigate to profile page
        console.log('Navigate to profile');
        break;
      case 'settings':
        // Navigate to settings page
        console.log('Navigate to settings');
        break;
      case 'help':
        // Open help panel or navigate to help page
        console.log('Open help');
        break;
    }
  }, [logoutWithRedirect]);

  return (
    <header className={`
      z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 
      transition-all duration-200
      ${isScrolled ? 'shadow-sm bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60' : ''}
      ${className}
    `}>
      <div className="flex items-center justify-between">
        {/* Left side - Mobile Menu Toggle and Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          {showMobileSidebarToggle && (
            <button
              type="button"
              onClick={onMobileSidebarToggle}
              data-mobile-sidebar-toggle="true"
              className="p-2 rounded-lg hover:bg-slate-100 lg:hidden transition-colors"
              aria-label="Open sidebar"
            >
              <Icon name="Bars3Icon" size="md" className="text-slate-600" />
            </button>
          )}

          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {/* <div className="hidden lg:flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Maya Admin
              </span>
            </div> */}
            
            {title && (
              <>
                <div className="hidden lg:block w-px h-6 bg-slate-300"></div>
                <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              </>
            )}
          </div>
        </div>

        {/* Center - Search and Quick Actions */}
        <div className="flex-1 flex items-center justify-center max-w-2xl mx-8 space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 max-w-md">
              <SearchBox
                placeholder="Search users, bookings, payments..."
                onSearch={handleSearch}
                size="sm"
                shortcutKey="/"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              type="button"
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Quick add"
              title="Quick Add"
            >
              <Icon name="PlusIcon" size="sm" />
            </button>
            
            <button
              type="button"
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Global search"
              title="Global Search (Ctrl+K)"
            >
              <Icon name="CommandLineIcon" size="sm" />
            </button>
          </div>
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions for Mobile */}
          <div className="flex lg:hidden items-center space-x-1">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Quick add"
            >
              <Icon name="PlusIcon" size="sm" />
            </button>
          </div>

          {/* Notifications */}
          {showNotifications && (
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                aria-label="Notifications"
              >
                <Icon name="BellIcon" size="sm" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center">
                      <span className="text-xs font-medium text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </span>
                  </span>
                )}
              </button>

              {/* Enhanced Notification Panel */}
              {showNotificationPanel && (
                <div className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                        <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                          Mark all read
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${
                          notification.unread 
                            ? 'bg-blue-50/50 border-l-blue-500' 
                            : 'border-l-transparent'
                        } ${index !== notifications.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.unread ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
                            <p className="text-xs text-slate-500 mt-2 flex items-center">
                              <Icon name="ClockIcon" size="xs" className="mr-1" />
                              {notification.time}
                            </p>
                          </div>
                          <button className="text-slate-400 hover:text-slate-600 p-1">
                            <Icon name="EllipsisVerticalIcon" size="xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-sm rounded-xl p-2 hover:bg-slate-100 transition-all duration-200 border border-transparent hover:border-slate-200"
              aria-label="User menu"
            >
              <Avatar
                name={user?.full_name || 'User'}
                size="sm"
                status="online"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-900 truncate max-w-24">
                  {user?.full_name || 'User'}
                </p>
              </div>
              <Icon name="ChevronDownIcon" size="xs" className="text-slate-400" />
            </button>

            {/* Enhanced User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={user?.full_name || 'User'}
                      size="lg"
                      status="online"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user?.email || 'No email'}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-slate-500">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  {userMenuOptions.map((option) => {
                    if (option.divider) {
                      return <div key={option.value} className="border-t border-slate-100 my-2" />;
                    }

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleUserMenuSelect(option.value)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                      >
                        {option.icon && (
                          <Icon 
                            name={option.icon as any} 
                            size="sm" 
                            className="text-slate-500 group-hover:text-slate-700" 
                          />
                        )}
                        <span className="font-medium">{option.label}</span>
                        {option.value === 'logout' && (
                          <Icon name="ArrowRightIcon" size="xs" className="ml-auto text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Memoize for performance
const MemoizedHeader = memo(Header, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedHeader.displayName = 'Header';

export default MemoizedHeader;