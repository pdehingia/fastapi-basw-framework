import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // TanStack Router file-based routing
    TanStackRouterVite({
      routesDirectory: './src/components/pages',
      generatedRouteTree: './src/routeTree.gen.ts',
      quoteStyle: 'single',
      routeFileIgnorePattern: '(index|component)\\.tsx?$', // Ignore component files, only scan route files
    }),
    // Bundle analyzer (only when ANALYZE env var is set)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React and React DOM
          react: ['react', 'react-dom'],
          
          // TanStack libraries
          tanstack: ['@tanstack/react-query', '@tanstack/react-router', '@tanstack/react-table'],
          
          // UI libraries
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          
          // Form and validation
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          utils: ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
          
          // Charts and visualization
          charts: ['recharts'],
          
          // State management
          state: ['zustand'],
          
          // Toast notifications
          toast: ['react-hot-toast'],
        },
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Target for modern browsers
    target: 'es2015',
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  // Performance optimizations for development
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/react-router',
      'react-hot-toast',
      'axios',
      'zustand',
    ],
  },
})