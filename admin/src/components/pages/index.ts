/**
 * Lazy-loaded route components for code splitting
 * Each route is loaded only when needed to improve initial bundle size
 */

import React, { Suspense, lazy } from 'react';

// Loading component for Suspense fallback
const LoadingFallback: React.FC = () => (
  React.createElement('div', {
    className: 'flex items-center justify-center h-64'
  }, React.createElement('div', {
    className: 'animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600'
  }))
);

// Lazy load page components using correct relative paths
export const LazyDashboard = lazy(() => import('./_protected/dashboard/dashboardPage'));
export const LazyUserList = lazy(() => import('./_protected/users/userListPage'));
export const LazyUserDetail = lazy(() => import('./_protected/users/userDetailPage'));
export const LazyBookingList = lazy(() => import('./_protected/bookings/bookingListPage'));
export const LazyAdvancedAnalytics = lazy(() => import('./_protected/AdvancedAnalyticsPage'));

// Higher-order component to wrap lazy components with Suspense
export const withSuspense = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback: React.ComponentType = LoadingFallback
) => {
  const SuspenseWrapper: React.FC<P> = (props: P) => (
    React.createElement(Suspense, {
      fallback: React.createElement(fallback)
    }, React.createElement(Component, props as any))
  );
  
  SuspenseWrapper.displayName = `withSuspense(${(Component as any).displayName || 'Component'})`;
  return SuspenseWrapper;
};

// Pre-wrapped components ready to use - only include existing pages
export const Dashboard = withSuspense(LazyDashboard);
export const UserList = withSuspense(LazyUserList);
export const UserDetail = withSuspense(LazyUserDetail);
export const BookingList = withSuspense(LazyBookingList);
export const AdvancedAnalytics = withSuspense(LazyAdvancedAnalytics);