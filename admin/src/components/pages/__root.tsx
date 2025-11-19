/**
 * Root Route
 * Base layout with error boundaries, devtools, and global providers
 * Improved with better error handling and performance
 */

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Spinner } from '@/components/atoms';
import { Suspense } from 'react';

// Root Error Component
function RootErrorComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">An error occurred while loading the application.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}

// Root Loading Component
function RootPendingComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading Maya Admin...</p>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <Suspense fallback={<RootPendingComponent />}>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </Suspense>
  ),
  errorComponent: RootErrorComponent,
  pendingComponent: RootPendingComponent,
});