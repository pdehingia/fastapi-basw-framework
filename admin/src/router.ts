/**
 * TanStack Router configuration
 * Main router setup with routes and authentication guards
 */

import React from 'react';
import { createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/components/pages/LoginPage';
import DashboardPage from '@/components/pages/DashboardPage';

// Root route component
const RootComponent = () => {
  return React.createElement('div', { id: 'app' }, React.createElement(Outlet, null));
};

// Root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    // Redirect to dashboard if already authenticated
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
});

// Dashboard route (protected)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
  beforeLoad: () => {
    // Redirect to login if not authenticated
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      });
    }
  },
});

// Index route - redirect to dashboard or login
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    throw redirect({
      to: isAuthenticated ? '/dashboard' : '/login',
    });
  },
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
]);

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // Default error component
  defaultErrorComponent: ({ error }) => 
    React.createElement('div', { 
      className: 'min-h-screen bg-gray-50 flex items-center justify-center' 
    }, 
      React.createElement('div', { className: 'text-center' },
        React.createElement('h1', { 
          className: 'text-2xl font-bold text-gray-900 mb-2' 
        }, 'Something went wrong'),
        React.createElement('p', { 
          className: 'text-gray-600 mb-4' 
        }, error.message),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          className: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
        }, 'Reload Page')
      )
    ),
});

// Router type for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}