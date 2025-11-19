/**
 * Toast Hook
 * Simple toast notification system
 */

import React, { useState, useCallback, useContext, createContext, ReactNode } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

// Create a simple toast context for now
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = newToast.duration || 5000;
    
    const toastWithId = { ...newToast, id };
    setToasts(prev => [...prev, toastWithId]);

    // Auto dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, toast, dismiss } },
    children
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Provide a simple fallback for development
    return {
      toast: (options: Omit<Toast, 'id'>) => {
        console.log(`Toast: ${options.title}`, options.description || '', options.variant || 'default');
      },
      dismiss: (id: string) => {
        console.log(`Dismiss toast: ${id}`);
      },
    };
  }
  
  const { toast, dismiss } = context;
  return { toast, dismiss };
}