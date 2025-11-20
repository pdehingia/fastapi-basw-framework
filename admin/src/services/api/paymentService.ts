/**
 * Payment Service
 * Handles all payment-related API calls
 */

import {  PaginatedResponse } from '../../types/api.types';

export interface Payment {
  id: string;
  booking_id: string;
  customer_name: string;
  provider_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  transaction_id: string;
  processing_fee: number;
  platform_fee: number;
  net_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetail extends Payment {
  customer_email: string;
  provider_email: string;
  booking_details: {
    service_type: string;
    booking_date: string;
    duration: number;
    location: string;
  };
  refund_history?: RefundRecord[];
  dispute_info?: DisputeInfo;
}

export interface RefundRecord {
  id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  admin_notes: string;
  processed_at: string;
  processed_by: string;
}

export interface DisputeInfo {
  id: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  filed_by: 'customer' | 'provider';
  filed_at: string;
  resolution?: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface PaymentFilters {
  page?: number;
  page_size?: number;
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
}

export interface RefundRequest {
  amount: number;
  reason: string;
  refund_type: 'full' | 'partial';
  admin_notes?: string;
  notify_customer?: boolean;
  processing_fee_waived?: boolean;
}

export interface DisputeResolution {
  resolution: 'favor_customer' | 'favor_provider' | 'no_fault';
  refund_amount?: number;
  admin_notes: string;
}

export interface PlatformFees {
  artist_commission_rate: number;
  platform_fee_rate: number;
  payment_processing_fee: number;
  cancellation_fee: number;
  minimum_booking_amount: number;
}

export interface FinancialReport {
  period: string;
  total_revenue: number;
  total_refunds: number;
  platform_fees: number;
  processing_fees: number;
  net_revenue: number;
  transaction_count: number;
  average_transaction_value: number;
  refund_rate: number;
}

export const paymentService = {
  // Get all payments with pagination and filtering
  async getPayments(filters: PaymentFilters = {}): Promise<PaginatedResponse<Payment>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/admin/v1/payments/?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  },

  // Get payment details by ID
  async getPaymentDetail(id: string): Promise<PaymentDetail> {
    const response = await fetch(`/api/admin/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    return response.json();
  },

  // Process refund
  async processRefund(paymentId: string, refundData: RefundRequest): Promise<RefundRecord> {
    const response = await fetch(`/api/admin/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(refundData),
    });

    if (!response.ok) {
      throw new Error('Failed to process refund');
    }

    return response.json();
  },

  // Get payment disputes
  async getDisputes(filters: { status?: string; page?: number } = {}): Promise<PaginatedResponse<DisputeInfo>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/admin/v1/payments/disputes?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch disputes');
    }

    return response.json();
  },

  // Resolve dispute
  async resolveDispute(disputeId: string, resolution: DisputeResolution): Promise<DisputeInfo> {
    const response = await fetch(`/api/admin/v1/payments/disputes/${disputeId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(resolution),
    });

    if (!response.ok) {
      throw new Error('Failed to resolve dispute');
    }

    return response.json();
  },

  // Get financial reports
  async getFinancialReports(period: string, year?: string): Promise<FinancialReport[]> {
    const params = new URLSearchParams({ period });
    if (year) {
      params.append('year', year);
    }

    const response = await fetch(`/api/admin/v1/payments/reports?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch financial reports');
    }

    return response.json();
  },

  // Export payment data
  async exportPaymentData(exportConfig: {
    format: 'csv' | 'excel';
    date_range: { start_date: string; end_date: string };
    filters?: PaymentFilters;
    include_refunds?: boolean;
    group_by?: string;
  }): Promise<Blob> {
    const response = await fetch('/api/admin/v1/payments/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(exportConfig),
    });

    if (!response.ok) {
      throw new Error('Failed to export payment data');
    }

    return response.blob();
  },

  // Get platform fees
  async getPlatformFees(): Promise<PlatformFees> {
    const response = await fetch('/api/admin/v1/payments/platform-fees', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch platform fees');
    }

    return response.json();
  },

  // Update platform fees
  async updatePlatformFees(fees: Partial<PlatformFees>): Promise<PlatformFees> {
    const response = await fetch('/api/admin/v1/payments/platform-fees', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(fees),
    });

    if (!response.ok) {
      throw new Error('Failed to update platform fees');
    }

    return response.json();
  },
};
