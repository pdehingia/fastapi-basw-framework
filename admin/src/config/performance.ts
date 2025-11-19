/**
 * Performance and Bundle Analysis Configuration
 * Vite configuration for optimizing build performance and analyzing bundle size
 */

import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export const performanceConfig = defineConfig({
  build: {
    // Enable source maps for better debugging
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
        
        // Naming pattern for chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '') 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        // Asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // External dependencies (if needed)
      external: [],
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      mangle: {
        safari10: true, // Ensure Safari 10 compatibility
      },
    },
    
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Target for older browsers if needed
    target: 'es2015',
    
    // Report compressed file sizes
    reportCompressedSize: true,
    
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
    exclude: [
      // Exclude large dependencies that shouldn't be pre-bundled
    ],
  },
  
  plugins: [
    // Bundle analyzer (only in analyze mode)
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: 'treemap', 'sunburst', 'network'
    })] : []),
  ].filter(Boolean),
});

// Performance monitoring utilities
export const performanceMonitoring = {
  // Web Vitals tracking
  trackWebVitals: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Handle different entry types
          if ('value' in entry) {
            console.log(`${entry.name}: ${(entry as any).value}ms`);
          } else {
            console.log(`${entry.name}: ${entry.duration}ms`);
          }
          
          // You can send this data to analytics service
          // analytics.track('web_vital', {
          //   metric: entry.name,
          //   value: (entry as any).value || entry.duration,
          //   url: window.location.href,
          // });
        });
      });
      
      // Observe different performance metrics
      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
  },
  
  // Resource timing
  trackResourceTiming: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource');
      
      resources.forEach((resource) => {
        const timing = resource as PerformanceResourceTiming;
        console.log(`Resource: ${timing.name}, Load time: ${timing.duration}ms`);
      });
    }
  },
  
  // Bundle size tracking
  trackBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // This would typically be done at build time
      console.log('Bundle size tracking should be configured at build time');
    }
  },
};