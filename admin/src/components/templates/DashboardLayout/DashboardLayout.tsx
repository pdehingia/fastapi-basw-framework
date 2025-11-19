/**
 * DashboardLayout Template Component
 * Modern, responsive layout with enhanced sidebar, header, and content areas
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { shallowEqual } from '@/utils/performance';
import { Header, Sidebar } from '@/components/organisms';
import type { 
  HeaderProps, 
  SidebarProps, 
  NavigationMenuProps
} from '@/components/organisms';

export interface DashboardLayoutProps {
  headerProps?: Partial<HeaderProps>;
  sidebarProps?: Partial<SidebarProps>;
  navigationProps?: Partial<NavigationMenuProps>;
  children?: React.ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  pageTitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  headerProps = {},
  sidebarProps = {},
  children,
  className = '',
}) => {
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('maya-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle sidebar toggle with persistence
  const handleSidebarToggle = useCallback(() => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('maya-sidebar-collapsed', JSON.stringify(newCollapsed));
  }, [sidebarCollapsed]);

  // Handle mobile sidebar toggle
  const handleMobileSidebarToggle = useCallback(() => {
    setSidebarMobileOpen(!sidebarMobileOpen);
  }, [sidebarMobileOpen]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarMobileOpen && !event.target) return;
      
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('[data-sidebar="true"]');
      const mobileToggle = document.querySelector('[data-mobile-sidebar-toggle="true"]');
      
      if (sidebar && !sidebar.contains(target) && !mobileToggle?.contains(target)) {
        setSidebarMobileOpen(false);
      }
    };

    if (sidebarMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarMobileOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll detection for header shadow
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setIsScrolled(mainContentRef.current.scrollTop > 0);
      }
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [location.pathname]);

  // Merge props with enhanced defaults
  const mergedHeaderProps: HeaderProps = {
    showMobileSidebarToggle: true,
    onMobileSidebarToggle: handleMobileSidebarToggle,
    isScrolled,
    ...headerProps,
  };

  const mergedSidebarProps: SidebarProps = {
    collapsed: sidebarCollapsed,
    mobileOpen: sidebarMobileOpen,
    onToggleCollapse: handleSidebarToggle,
    onMobileToggle: handleMobileSidebarToggle,
    ...sidebarProps,
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${className}`}>
      

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar {...mergedSidebarProps} />

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col min-w-0">
            {/* Fixed Header */}
            <Header {...mergedHeaderProps} />
          {/* Navigation/Breadcrumb Area */}
          {/* {(showBreadcrumbs || pageTitle || navigationProps.title || navigationProps.breadcrumbs || navigationProps.actions) && (
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <NavigationMenu {...mergedNavigationProps} />
            </div>
          )} */}

          {/* Scrollable Content Area */}
          <main 
            ref={mainContentRef}
            className={`
              flex-1 overflow-y-auto overflow-x-hidden
              transition-all duration-200 ease-in-out
              bg-slate-50
            `}
          >
            {/* Content Container */}
            <div className="min-h-full">
              {/* Page Content with Improved Spacing */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {children || <Outlet />}
              </div>

              {/* Footer Spacer */}
              <div className="h-8 flex-shrink-0"></div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar backdrop with enhanced animations */}
      {sidebarMobileOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-all duration-300"
            onClick={() => setSidebarMobileOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-y-0 left-0 w-full max-w-xs">
              {/* Mobile sidebar content is handled by Sidebar component */}
            </div>
          </div>
        </>
      )}

      {/* Scroll to top button */}
      {isScrolled && (
        <button
          onClick={() => mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Memoize for performance
const MemoizedDashboardLayout = memo(DashboardLayout, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedDashboardLayout.displayName = 'DashboardLayout';

export default MemoizedDashboardLayout;