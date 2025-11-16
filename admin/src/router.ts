/**
 * TanStack Router Configuration
 * File-based routing with automatic route generation
 */

import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// Create router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {},
  // Handle 404s by redirecting to login
  defaultNotFoundComponent: () => {
    // For any unmatched route (like /), redirect to login
    window.location.replace('/auth/login');
    return null;
  },
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}