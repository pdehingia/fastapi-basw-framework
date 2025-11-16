/**
 * Login Page - Static loading, no unnecessary spinners
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { AuthLayout } from '@/components/templates';
import { LoginForm } from '@/components/organisms';
import { ROUTES } from '@/config/routes';

// Search params type
type LoginSearch = {
  redirect?: string;
  error?: string;
};

// Simple Login Component - NO SUSPENSE for static content
function LoginComponent() {
  return (
    <AuthLayout 
      title="Welcome Back"
      subtitle="Sign in to your Maya Admin account"
    >
      <LoginForm />
    </AuthLayout>
  );
}

export const Route = createFileRoute('/auth/login')({
  component: LoginComponent,
  
  // Redirect if already logged in - wait for auth initialization
  beforeLoad: async ({ search }) => {
    const timestamp = new Date().toISOString();
    console.log(`🔐 [LOGIN GUARD ${timestamp}] Checking if user is already authenticated...`);
    
    const authState = useAuthStore.getState();
    
    // If not initialized yet, wait for initialization to complete
    if (!authState.isInitialized) {
      console.log(`🔐 [LOGIN GUARD ${timestamp}] Auth not initialized, waiting for initialization...`);
      
      // Trigger initialization if not already started
      await useAuthStore.getState().initAuth();
      
      // Get fresh state after initialization
      const freshAuthState = useAuthStore.getState();
      console.log(`🔐 [LOGIN GUARD ${timestamp}] Auth initialization completed. Fresh state:`, {
        isInitialized: freshAuthState.isInitialized,
        user: freshAuthState.user?.email || 'No user',
        isAuthenticated: freshAuthState.isAuthenticated,
        hasUser: !!freshAuthState.user
      });
      
      // Check if already authenticated after initialization
      if (freshAuthState.isAuthenticated && freshAuthState.user) {
        const redirectTo = (search as LoginSearch)?.redirect || ROUTES.DASHBOARD;
        console.log(`🔐 [LOGIN GUARD ${timestamp}] ✅ User already authenticated, redirecting to:`, redirectTo);
        throw redirect({ to: redirectTo, replace: true });
      }
    } else {
      console.log(`🔐 [LOGIN GUARD ${timestamp}] Auth already initialized. Current state:`, {
        isInitialized: authState.isInitialized,
        user: authState.user?.email || 'No user',
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user
      });
      
      // Check if already authenticated with current state
      if (authState.isAuthenticated && authState.user) {
        const redirectTo = (search as LoginSearch)?.redirect || ROUTES.DASHBOARD;
        console.log(`🔐 [LOGIN GUARD ${timestamp}] ✅ User already authenticated, redirecting to:`, redirectTo);
        throw redirect({ to: redirectTo, replace: true });
      }
    }
    
    console.log(`🔐 [LOGIN GUARD ${timestamp}] ✅ User not authenticated, showing login page`);
  },

  validateSearch: (search): LoginSearch => {
    return {
      redirect: search.redirect as string | undefined,
      error: search.error as string | undefined,
    };
  },
});