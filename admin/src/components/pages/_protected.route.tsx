/**
 * Protected Routes Layout
 * Enhanced auth guard with better UX and error handling
 */

import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { Suspense } from 'react';
import { Spinner } from '@/components/atoms';
import { ROUTES } from '@/config/routes';

// Loading component for protected routes
function ProtectedPendingComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

// Error component for protected routes
function ProtectedErrorComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Access Error</h1>
        <p className="text-gray-600 mb-6">Unable to load the protected content.</p>
        <button
          onClick={() => window.location.href = ROUTES.LOGIN}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ location }) => {
    const timestamp = new Date().toISOString();
    console.log(`🛡️ [PROTECTED ROUTE ${timestamp}] Guard triggered for PROTECTED path:`, location.pathname);
    
    // Wait for auth initialization to complete before checking state
    const authState = useAuthStore.getState();
    
    // If not initialized yet, wait for initialization to complete
    if (!authState.isInitialized) {
      console.log(`🛡️ [PROTECTED ROUTE ${timestamp}] Auth not initialized, waiting for initialization...`);
      
      // Trigger initialization if not already started
      await useAuthStore.getState().initAuth();
      
      // Get fresh state after initialization
      const freshAuthState = useAuthStore.getState();
      console.log(`🛡️ [PROTECTED ROUTE ${timestamp}] Auth initialization completed. Fresh state:`, {
        isInitialized: freshAuthState.isInitialized,
        user: freshAuthState.user?.email || 'No user',
        isAuthenticated: freshAuthState.isAuthenticated,
        hasUser: !!freshAuthState.user,
        requestedPath: location.pathname
      });
      
      // Check auth with fresh state
      if (!freshAuthState.user || !freshAuthState.isAuthenticated) {
        console.warn(`🛡️ [PROTECTED ROUTE ${timestamp}] ❌ UNAUTHORIZED after init - redirecting to LOGIN`);
        throw redirect({
          to: ROUTES.LOGIN,
          search: {
            redirect: location.href,
          },
          replace: true,
        });
      }
    } else {
      console.log(`🛡️ [PROTECTED ROUTE ${timestamp}] Auth already initialized. Current state:`, {
        isInitialized: authState.isInitialized,
        user: authState.user?.email || 'No user',
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        requestedPath: location.pathname
      });
      
      // Check auth with current state
      if (!authState.user || !authState.isAuthenticated) {
        console.warn(`🛡️ [PROTECTED ROUTE ${timestamp}] ❌ UNAUTHORIZED access attempt to: ${location.pathname} → Redirecting to LOGIN`);
        throw redirect({
          to: ROUTES.LOGIN,
          search: {
            redirect: location.href,
          },
          replace: true,
        });
      }
    }
    
    console.log(`🛡️ [PROTECTED ROUTE ${timestamp}] ✅ ACCESS GRANTED for: ${location.pathname}`);
  },
  
  component: () => (
    <Suspense fallback={<ProtectedPendingComponent />}>
      <Outlet />
    </Suspense>
  ),
  
  errorComponent: ProtectedErrorComponent,
  pendingComponent: ProtectedPendingComponent,
});