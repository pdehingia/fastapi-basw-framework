/**
 * Enhanced Payment Management API Service
 * Comprehensive payment and financial operations based on Maya Admin Panel Postman collection
 */

import { apiService } from './base';
import { PAYMENT_ENDPOINTS } from '@/config/api';
import type {
  
  PaginatedResponse,
  Payment,
  RefundRequest,
  PaymentDispute,
  QueryParams,
} from '@/types/api.types';

export class PaymentService {
  /**
   * Get paginated list of payments with filtering
   */
  async getPayments(
    params: {
      page?: number;
      limit?: number;
      status?: 'pending' | 'completed' | 'failed' | 'refunded';
      payment_method?: string;
      customer_id?: string;
      provider_id?: string;
      booking_id?: string;
      date_from?: string;
      date_to?: string;
      min_amount?: number;
      max_amount?: number;
      search?: string;
    } & QueryParams = {}
  ): Promise<PaginatedResponse<Payment>> {
    return await apiService.get<PaginatedResponse<Payment>>(PAYMENT_ENDPOINTS.LIST, params);
  }

  /**
   * Get single payment by ID with full transaction details
   */
  async getPayment(id: string): Promise<Payment & {
    booking_details?: {
      id: string;
      service_name: string;
      provider_name: string;
      customer_name: string;
      booking_date: string;
    };
    refund_history?: Array<{
      id: string;
      amount: number;
      status: string;
      reason: string;
      processed_at: string;
    }>;
    dispute_info?: PaymentDispute;
  }> {
    return await apiService.get<any>(PAYMENT_ENDPOINTS.GET(id));
  }

  /**
   * Process payment refund with detailed tracking
   */
  async processRefund(paymentId: string, refundData: RefundRequest): Promise<{
    refund_id: string;
    payment_id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    estimated_completion: string;
    transaction_id: string;
    created_at: string;
  }> {
    return await apiService.post<any>(PAYMENT_ENDPOINTS.REFUND(paymentId), refundData);
  }

  /**
   * Get payment disputes and claims
   */
  async getPaymentDisputes(params: {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    created_from?: string;
    created_to?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<PaymentDispute>> {
    return await apiService.get<PaginatedResponse<PaymentDispute>>(PAYMENT_ENDPOINTS.DISPUTES, params);
  }

  /**
   * Resolve payment dispute
   */
  async resolveDispute(disputeId: string, resolution: {
    resolution_type: 'refund' | 'partial_refund' | 'reject' | 'escalate';
    amount?: number;
    reason: string;
    admin_notes: string;
    notify_parties?: boolean;
  }): Promise<{
    dispute_id: string;
    status: 'resolved' | 'escalated';
    resolution_type: string;
    amount_refunded?: number;
    resolved_at: string;
    resolved_by: string;
  }> {
    return await apiService.post<any>(PAYMENT_ENDPOINTS.RESOLVE_DISPUTE(disputeId), resolution);
  }

  /**
   * Generate comprehensive payment reports
   */
  async getPaymentReports(params: {
    report_type: 'summary' | 'detailed' | 'reconciliation' | 'tax' | 'refunds';
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    start_date?: string;
    end_date?: string;
    currency?: string;
    payment_method?: string;
    format?: 'json' | 'csv' | 'pdf' | 'excel';
  }): Promise<{
    report_id: string;
    total_transactions: number;
    total_amount: number;
    total_refunds: number;
    net_revenue: number;
    processing_fees: number;
    by_payment_method: Array<{
      method: string;
      count: number;
      amount: number;
      percentage: number;
    }>;
    by_status: Array<{
      status: string;
      count: number;
      amount: number;
    }>;
    daily_breakdown?: Array<{
      date: string;
      transactions: number;
      amount: number;
      refunds: number;
    }>;
    generated_at: string;
  }> {
    return await apiService.get<any>(PAYMENT_ENDPOINTS.REPORTS, params);
  }

  /**
   * Export payment data to various formats
   */
  async exportPayments(params: {
    format: 'csv' | 'excel' | 'pdf';
    filters?: any;
    fields?: string[];
    date_range?: {
      start_date: string;
      end_date: string;
    };
  }): Promise<Blob> {
    return await apiService.getBlob(PAYMENT_ENDPOINTS.EXPORT, params);
  }

  /**
   * Get platform fee configuration and calculations
   */
  async getPlatformFees(params: {
    calculation_type?: 'current' | 'historical';
    period?: 'month' | 'quarter' | 'year';
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{
    fee_structure: {
      percentage: number;
      fixed_fee: number;
      minimum_fee: number;
      maximum_fee?: number;
    };
    total_fees_collected: number;
    fees_by_period: Array<{
      period: string;
      total_transactions: number;
      total_amount: number;
      fees_collected: number;
      average_fee_rate: number;
    }>;
    top_contributors: Array<{
      provider_id: string;
      provider_name: string;
      transactions: number;
      revenue: number;
      fees_paid: number;
    }>;
  }> {
    return await apiService.get<any>(PAYMENT_ENDPOINTS.PLATFORM_FEES, params);
  }

  /**
   * Get payment analytics for dashboard
   */
  async getPaymentAnalytics(params: {
    period: 'today' | 'week' | 'month' | 'quarter' | 'year';
    compare_previous?: boolean;
  }): Promise<{
    total_revenue: number;
    total_transactions: number;
    successful_payments: number;
    failed_payments: number;
    refunded_amount: number;
    pending_amount: number;
    growth_rate: number;
    average_transaction_value: number;
    payment_methods_breakdown: Array<{
      method: string;
      count: number;
      amount: number;
      success_rate: number;
    }>;
    revenue_trends: Array<{
      date: string;
      amount: number;
      transactions: number;
    }>;
    top_customers: Array<{
      customer_id: string;
      customer_name: string;
      total_spent: number;
      transaction_count: number;
    }>;
  }> {
    return await apiService.get<any>(`${PAYMENT_ENDPOINTS.LIST}analytics`, params);
  }

  /**
   * Bulk payment operations
   */
  async bulkPaymentActions(action: {
    payment_ids: string[];
    action_type: 'refund' | 'void' | 'export' | 'mark_reviewed';
    parameters?: any;
    reason?: string;
    admin_notes?: string;
  }): Promise<{
    processed_count: number;
    failed_count: number;
    results: Array<{
      payment_id: string;
      status: 'success' | 'failed';
      error?: string;
    }>;
  }> {
    return await apiService.post<any>(`${PAYMENT_ENDPOINTS.LIST}bulk-actions`, action);
  }

  /**
   * Get payment gateway status and health
   */
  async getGatewayStatus(): Promise<{
    gateways: Array<{
      name: string;
      status: 'online' | 'offline' | 'degraded';
      response_time: number;
      success_rate: number;
      last_checked: string;
      supported_methods: string[];
    }>;
    overall_health: 'healthy' | 'warning' | 'critical';
    total_transactions_today: number;
    failure_rate_today: number;
  }> {
    return await apiService.get<any>(`${PAYMENT_ENDPOINTS.LIST}gateway-status`);
  }

  /**
   * Get payment fraud detection insights
   */
  async getFraudDetection(params: {
    period?: 'week' | 'month' | 'quarter';
    risk_level?: 'low' | 'medium' | 'high';
  } = {}): Promise<{
    total_flagged: number;
    confirmed_fraud: number;
    false_positives: number;
    prevented_loss: number;
    risk_factors: Array<{
      factor: string;
      occurrences: number;
      success_rate: number;
    }>;
    flagged_transactions: Array<{
      payment_id: string;
      risk_score: number;
      risk_factors: string[];
      status: 'pending_review' | 'approved' | 'blocked';
      created_at: string;
    }>;
  }> {
    return await apiService.get<any>(`${PAYMENT_ENDPOINTS.LIST}fraud-detection`, params);
  }
}

// Export service instance
export const paymentService = new PaymentService();
export default PaymentService;
