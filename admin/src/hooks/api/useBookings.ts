/**
 * Booking API Hooks
 * TanStack Query hooks for booking-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/api';
import { toast } from '@/services/toast';
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingStatusUpdate,
  BookingFilters,
  PaginatedResponse,
  QueryParams,
} from '@/types/api.types';

// Query Keys
export const BOOKING_QUERY_KEYS = {
  all: ['bookings'] as const,
  lists: () => [...BOOKING_QUERY_KEYS.all, 'list'] as const,
  list: (filters: BookingFilters & QueryParams) => [...BOOKING_QUERY_KEYS.lists(), filters] as const,
  details: () => [...BOOKING_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BOOKING_QUERY_KEYS.details(), id] as const,
  stats: () => [...BOOKING_QUERY_KEYS.all, 'stats'] as const,
  search: (query: string) => [...BOOKING_QUERY_KEYS.all, 'search', query] as const,
  customer: (customerId: string) => [...BOOKING_QUERY_KEYS.all, 'customer', customerId] as const,
  provider: (providerId: string) => [...BOOKING_QUERY_KEYS.all, 'provider', providerId] as const,
  upcoming: () => [...BOOKING_QUERY_KEYS.all, 'upcoming'] as const,
  overdue: () => [...BOOKING_QUERY_KEYS.all, 'overdue'] as const,
  timeline: (id: string) => [...BOOKING_QUERY_KEYS.detail(id), 'timeline'] as const,
} as const;

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch paginated list of bookings
 */
export const useBookings = (params: BookingFilters & QueryParams = {}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.list(params),
    queryFn: async () => {
      const response = await bookingService.getBookings(params);
      return response.data;
    },
    enabled: true,
  });
};

/**
 * Hook to fetch a single booking by ID
 */
export const useBooking = (id: string, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.detail(id),
    queryFn: () => bookingService.getBooking(id),
    enabled: !!id && (options.enabled !== false),
  });
};

/**
 * Hook to fetch booking statistics
 */
export const useBookingStats = () => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.stats(),
    queryFn: () => bookingService.getBookingStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch bookings by customer
 */
export const useBookingsByCustomer = (customerId: string, params: QueryParams = {}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.customer(customerId),
    queryFn: () => bookingService.getBookingsByCustomer(customerId, params),
    enabled: !!customerId,
  });
};

/**
 * Hook to fetch bookings by provider
 */
export const useBookingsByProvider = (providerId: string, params: QueryParams = {}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.provider(providerId),
    queryFn: () => bookingService.getBookingsByProvider(providerId, params),
    enabled: !!providerId,
  });
};

/**
 * Hook to fetch upcoming bookings
 */
export const useUpcomingBookings = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.upcoming(),
    queryFn: () => bookingService.getUpcomingBookings(params),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook to fetch overdue bookings
 */
export const useOverdueBookings = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.overdue(),
    queryFn: () => bookingService.getOverdueBookings(params),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

/**
 * Hook to search bookings
 */
export const useBookingSearch = (query: string, filters: Omit<BookingFilters, 'search'> = {}) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.search(query),
    queryFn: () => bookingService.searchBookings(query, filters),
    enabled: query.length > 2, // Only search when query is longer than 2 characters
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch booking timeline
 */
export const useBookingTimeline = (id: string) => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.timeline(id),
    queryFn: () => bookingService.getBookingTimeline(id),
    enabled: !!id,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest) => {
      const response = await bookingService.createBooking(bookingData);
      return response.data;
    },
    onSuccess: (newBooking: Booking) => {
      // Invalidate and refetch booking lists
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.upcoming() });

      // Add new booking to cache
      queryClient.setQueryData(BOOKING_QUERY_KEYS.detail(newBooking.id), newBooking);

      toast.success('Booking created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create booking');
    },
  });
};

/**
 * Hook to update an existing booking
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookingRequest }) => {
      const response = await bookingService.updateBooking(id, data);
      return response.data;
    },
    onSuccess: (updatedBooking: Booking) => {
      // Update booking detail cache
      queryClient.setQueryData(BOOKING_QUERY_KEYS.detail(updatedBooking.id), updatedBooking);

      // Invalidate booking lists to reflect changes
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.stats() });

      toast.success('Booking updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update booking');
    },
  });
};

/**
 * Hook to update booking status
 */
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, statusUpdate }: { id: string; statusUpdate: BookingStatusUpdate }) => {
      const response = await bookingService.updateBookingStatus(id, statusUpdate);
      return response.data;
    },
    onSuccess: (updatedBooking: Booking) => {
      // Update booking detail cache
      queryClient.setQueryData(BOOKING_QUERY_KEYS.detail(updatedBooking.id), updatedBooking);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.upcoming() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.overdue() });

      toast.success(`Booking status updated to ${updatedBooking.status}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update booking status');
    },
  });
};

/**
 * Hook to cancel a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { booking_id: string; status: 'cancelled'; refund_amount?: number; refund_id?: string; cancelled_at: string }, 
    Error, 
    { id: string; reason?: string; refundAmount?: number }
  >({
    mutationFn: async ({ id, reason, refundAmount }: { id: string; reason?: string; refundAmount?: number }) => {
      const response = await bookingService.cancelBooking(id, reason || '', refundAmount);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Remove booking from cache and invalidate queries
      queryClient.removeQueries({ queryKey: BOOKING_QUERY_KEYS.detail(id) });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.upcoming() });

      toast.success('Booking cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel booking');
    },
  });
};

/**
 * Hook to delete a booking
 */
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bookingService.deleteBooking(id);
      return response.data;
    },
    onSuccess: (_, deletedId) => {
      // Remove booking from cache
      queryClient.removeQueries({ queryKey: BOOKING_QUERY_KEYS.detail(deletedId) });

      // Invalidate booking lists
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.stats() });

      toast.success('Booking deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete booking');
    },
  });
};

/**
 * Hook to add note to booking
 */
export const useAddBookingNote = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { note_id: string; booking_id: string; note: string; created_at: string; created_by: string }, 
    Error, 
    { id: string; note: { content: string; isPrivate?: boolean } }
  >({
    mutationFn: async ({ id, note }: { id: string; note: { content: string; isPrivate?: boolean } }) => {
      const response = await bookingService.addBookingNote(id, note.content);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidate booking detail to refetch with new note
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.detail(id) });

      // Invalidate timeline
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.timeline(id) });

      toast.success('Note added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add note');
    },
  });
};

/**
 * Hook to bulk update bookings
 */
export const useBulkUpdateBookings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingIds, updates }: { bookingIds: string[]; updates: Partial<UpdateBookingRequest> }) => {
      const response = await bookingService.bulkUpdateBookings(bookingIds, updates);
      return response.data;
    },
    onSuccess: (result: { updated: number; failed: Array<{ id: string; error: string }> }) => {
      // Invalidate all booking-related queries
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all });

      toast.success(`Successfully updated ${result.updated} bookings`);
      
      if (result.failed.length > 0) {
        toast.error(`Failed to update ${result.failed.length} bookings`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to bulk update bookings');
    },
  });
};

/**
 * Hook to export bookings data
 */
export const useExportBookings = () => {
  return useMutation({
    mutationFn: (filters: { format?: 'csv' | 'excel'; filters?: BookingFilters; fields?: string[] } = {}) => 
      bookingService.exportBookings(filters),
    onSuccess: (blob: Blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Bookings data exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to export bookings data');
    },
  });
};

// ==================== OPTIMISTIC UPDATE HELPERS ====================

/**
 * Hook to optimistically update booking status while mutation is pending
 */
export const useOptimisticBookingUpdate = () => {
  const queryClient = useQueryClient();

  const updateBookingOptimistically = (bookingId: string, updates: Partial<Booking>) => {
    // Update booking detail cache
    queryClient.setQueryData(
      BOOKING_QUERY_KEYS.detail(bookingId),
      (oldBooking: Booking | undefined) => oldBooking ? { ...oldBooking, ...updates } : undefined
    );

    // Update booking in lists
    queryClient.setQueriesData(
      { queryKey: BOOKING_QUERY_KEYS.lists() },
      (oldData: PaginatedResponse<Booking> | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.map((booking: Booking) =>
            booking.id === bookingId ? { ...booking, ...updates } : booking
          ),
        };
      }
    );
  };

  return { updateBookingOptimistically };
};
