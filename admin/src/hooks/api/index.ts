/**
 * API Hooks Index
 * Central export for all TanStack Query API hooks
 */

// User hooks
export * from './useUsers';

// Booking hooks  
export * from './useBookings';

// Dashboard hooks
export * from './useDashboard';

// Settings hooks
export * from './useSettings';

// Re-export query client utilities if needed
export { useQueryClient, useIsMutating, useIsFetching } from '@tanstack/react-query';