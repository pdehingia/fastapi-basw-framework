/**
 * Auth Pages Export
 * Centralized exports for authentication-related pages
 */

// Note: Login is a route component in login.tsx, not a regular component export
// The route is automatically handled by TanStack Router file-based routing

// Re-export route for reference (though routes are auto-discovered)
export { Route as LoginRoute } from './login';