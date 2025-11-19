/**
 * Enhanced Booking Management API Service  
 * Comprehensive booking operations based on Maya Admin Panel Postman collection
 */

import { apiService } from './base';
import { BOOKING_ENDPOINTS } from '@/config/api';
import type {
  ApiResponse,
  PaginatedResponse,
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingFilters,
  QueryParams,
} from '@/types/api.types';

export class BookingService {
  /**
   * Get paginated list of bookings with filtering and search
   */
  async getBookings(
    params: BookingFilters & QueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    return await apiService.get<PaginatedResponse<Booking>>(BOOKING_ENDPOINTS.LIST, params);
  }

  /**
   * Get single booking by ID with full details
   */
  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return await apiService.get<Booking>(BOOKING_ENDPOINTS.GET(id));
  }

  /**
   * Create new booking with comprehensive validation
   */
  async createBooking(data: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    return await apiService.post<Booking>(BOOKING_ENDPOINTS.CREATE, data);
  }

  /**
   * Update existing booking details
   */
  async updateBooking(id: string, data: UpdateBookingRequest): Promise<ApiResponse<Booking>> {
    return await apiService.put<Booking>(BOOKING_ENDPOINTS.UPDATE(id), data);
  }

  /**
   * Delete booking (admin only)
   */
  async deleteBooking(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(BOOKING_ENDPOINTS.DELETE(id));
  }

  /**
   * Update booking status (confirmed, cancelled, completed, etc.)
   */
  async updateBookingStatus(id: string, status: {
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
    reason?: string;
    notes?: string;
  }): Promise<ApiResponse<Booking>> {
    return await apiService.patch<Booking>(BOOKING_ENDPOINTS.UPDATE_STATUS(id), status);
  }

  /**
   * Get booking statistics and analytics
   */
  async getBookingStatistics(params: {
    period?: 'day' | 'week' | 'month' | 'year';
    start_date?: string;
    end_date?: string;
    service_type?: string;
  } = {}): Promise<ApiResponse<{
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    completed_bookings: number;
    pending_bookings: number;
    disputed_bookings: number;
    revenue_generated: number;
    average_booking_value: number;
    popular_services: Array<{
      service_id: string;
      service_name: string;
      booking_count: number;
      revenue: number;
    }>;
    trends: Array<{
      date: string;
      count: number;
      revenue: number;
    }>;
  }>> {
    return await apiService.get<any>(BOOKING_ENDPOINTS.STATISTICS, params);
  }

  /**
   * Export bookings to CSV/Excel
   */
  async exportBookings(params: {
    format?: 'csv' | 'excel';
    filters?: BookingFilters;
    fields?: string[];
  } = {}): Promise<Blob> {
    const response = await apiService.getBlob(BOOKING_ENDPOINTS.EXPORT, params);
    return response;
  }

  /**
   * Handle booking dispute - mark as disputed
   */
  async createBookingDispute(id: string, dispute: {
    reason: string;
    description: string;
    reported_by: 'customer' | 'provider' | 'admin';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<ApiResponse<{
    dispute_id: string;
    booking_id: string;
    status: 'pending' | 'investigating' | 'resolved';
    created_at: string;
  }>> {
    return await apiService.post<any>(BOOKING_ENDPOINTS.DISPUTE(id), dispute);
  }

  /**
   * Get booking calendar data for visual representation
   */
  async getBookingCalendar(params: {
    start_date: string;
    end_date: string;
    provider_id?: string;
    service_type?: string;
    view?: 'month' | 'week' | 'day';
  }): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    service_type: string;
    provider_name: string;
    customer_name: string;
    status: string;
    color?: string;
  }>>> {
    return await apiService.get<any>(BOOKING_ENDPOINTS.CALENDAR, params);
  }

  /**
   * Generate booking reports
   */
  async generateReport(config: {
    type: 'summary' | 'detailed' | 'financial' | 'performance';
    period: 'daily' | 'weekly' | 'monthly' | 'custom';
    start_date?: string;
    end_date?: string;
    filters?: BookingFilters;
    format?: 'json' | 'csv' | 'pdf';
  }): Promise<ApiResponse<{
    report_id: string;
    status: 'generating' | 'completed' | 'failed';
    download_url?: string;
    generated_at?: string;
  }>> {
    return await apiService.post<any>(`${BOOKING_ENDPOINTS.LIST}reports`, config);
  }

  /**
   * Get booking statistics (alias for getBookingStatistics for hook compatibility)
   */
  async getBookingStats(params: {
    period?: 'day' | 'week' | 'month' | 'year';
    start_date?: string;
    end_date?: string;
    service_type?: string;
  } = {}): Promise<ApiResponse<any>> {
    return this.getBookingStatistics(params);
  }

  /**
   * Get bookings by customer ID
   */
  async getBookingsByCustomer(
    customerId: string,
    params: BookingFilters & QueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    return await apiService.get<PaginatedResponse<Booking>>(
      `${BOOKING_ENDPOINTS.LIST}/customer/${customerId}`,
      params
    );
  }

  /**
   * Get bookings by provider ID
   */
  async getBookingsByProvider(
    providerId: string,
    params: BookingFilters & QueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    return await apiService.get<PaginatedResponse<Booking>>(
      `${BOOKING_ENDPOINTS.LIST}/provider/${providerId}`,
      params
    );
  }

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(
    params: BookingFilters & QueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    return await apiService.get<PaginatedResponse<Booking>>(
      `${BOOKING_ENDPOINTS.LIST}/upcoming`,
      params
    );
  }

  /**
   * Get overdue bookings
   */
  async getOverdueBookings(
    params: BookingFilters & QueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    return await apiService.get<PaginatedResponse<Booking>>(
      `${BOOKING_ENDPOINTS.LIST}/overdue`,
      params
    );
  }

  /**
   * Search bookings with query
   */
  async searchBookings(
    query: string,
    filters: BookingFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    return await apiService.get<PaginatedResponse<Booking>>(
      `${BOOKING_ENDPOINTS.LIST}/search`,
      { query, ...filters }
    );
  }

  /**
   * Get booking timeline/history
   */
  async getBookingTimeline(id: string): Promise<ApiResponse<Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    user_id?: string;
    user_name?: string;
    metadata?: Record<string, any>;
  }>>> {
    return await apiService.get<any>(`${BOOKING_ENDPOINTS.GET(id)}/timeline`);
  }

  /**
   * Cancel booking with reason and optional refund
   */
  async cancelBooking(
    id: string,
    reason: string,
    refundAmount?: number
  ): Promise<ApiResponse<{
    booking_id: string;
    status: 'cancelled';
    refund_amount?: number;
    refund_id?: string;
    cancelled_at: string;
  }>> {
    return await apiService.post<any>(`${BOOKING_ENDPOINTS.GET(id)}/cancel`, {
      reason,
      refund_amount: refundAmount
    });
  }

  /**
   * Add note to booking
   */
  async addBookingNote(
    id: string,
    note: string
  ): Promise<ApiResponse<{
    note_id: string;
    booking_id: string;
    note: string;
    created_at: string;
    created_by: string;
  }>> {
    return await apiService.post<any>(`${BOOKING_ENDPOINTS.GET(id)}/notes`, {
      note
    });
  }

  /**
   * Bulk update multiple bookings
   */
  async bulkUpdateBookings(
    bookingIds: string[],
    updates: Partial<UpdateBookingRequest>
  ): Promise<ApiResponse<{
    updated: number;
    failed: Array<{
      id: string;
      error: string;
    }>;
  }>> {
    return await apiService.put<any>(`${BOOKING_ENDPOINTS.LIST}/bulk`, {
      booking_ids: bookingIds,
      updates
    });
  }
}

// Export service instance
export const bookingService = new BookingService();
export default BookingService;