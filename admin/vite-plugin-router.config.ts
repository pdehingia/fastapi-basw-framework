// Vite plugin configuration for TanStack Router code generation
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default {
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/components/pages',
      generatedRouteTree: './src/routeTree.gen.ts',
      quoteStyle: 'single',
      routeFileIgnorePattern: '(component|DashboardPage|UserList|UserDetail|BookingList|Settings)\\.tsx?$', // Ignore component files, only scan route files
    }),
  ],
}