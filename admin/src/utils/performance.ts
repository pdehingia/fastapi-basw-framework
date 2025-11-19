/**
 * Performance optimization utilities
 * Helpers for React.memo, code splitting, and performance monitoring
 */

import { memo, lazy, ComponentType } from 'react';

/**
 * Higher-order component for memoizing components with custom comparison
 */
export const withMemo = <T extends Record<string, any>>(
  Component: ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) => {
  const MemoizedComponent = memo(Component, areEqual);
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoizedComponent;
};

/**
 * Shallow comparison function for React.memo
 */
export const shallowEqual = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Deep comparison function for complex objects
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index]));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
};

/**
 * Lazy load component with error boundary
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> => {
  return lazy(async () => {
    let lastError: Error;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await factory();
      } catch (error) {
        lastError = error as Error;
        
        // Wait before retry (exponential backoff)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError!;
  });
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(`${componentName} render time: ${end - start}ms`);
  },

  /**
   * Mark performance milestones
   */
  mark: (name: string) => {
    if (performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Measure between two marks
   */
  measure: (name: string, startMark: string, endMark: string) => {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
    }
  },

  /**
   * Get performance entries
   */
  getEntries: (type?: string) => {
    if (performance.getEntriesByType) {
      return type ? performance.getEntriesByType(type) : performance.getEntries();
    }
    return [];
  },
};

/**
 * Debounce utility for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func(...args);
    }, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle utility for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memoize expensive calculations
 */
export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};