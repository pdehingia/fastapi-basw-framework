/**
 * OPTIMIZED App component
 * No blocking auth initialization for public routes
 */

import React, { useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary';
import { useAuthStore } from '@/stores/authStore';

const App: React.FC = () => {
  const initAuth = useAuthStore(state => state.initAuth);

  // Initialize auth in background - don't block UI
  useEffect(() => {
    console.log('🚀 Initializing auth in background...');
    initAuth(); // No blocking, just start the process
  }, [initAuth]);

  // Render router immediately - let routes handle their own auth logic
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
};

export default App;