import { apiService } from './base';
import type {
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
  SubscriptionFilters,
  SubscriptionStatistics,
  SubscriptionPayment,
  SubscriptionPaymentCreate,
  PaymentStatistics,
  SubscriptionCancel,
  SubscriptionRenew,
  SubscriptionRetryPayment,
  ExpiringSubscription,
  QueryParams,
  PaginatedResponse,
  
} from '@/types/api.types';

/**
 * Service for managing subscriptions and subscription payments
 */
export class SubscriptionsService {
  private readonly basePath = '/api/admin/v1/business-operations/subscriptions';

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Get subscription statistics
   */
  async getSubscriptionStatistics() {
    return apiService.get<SubscriptionStatistics>(`${this.basePath}/statistics/overview`);
  }

  /**
   * Get paginated list of subscriptions
   */
  async getSubscriptions(filters: SubscriptionFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<Subscription>(this.basePath, {
      ...params,
      ...filters,
    });
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: SubscriptionCreate) {
    return apiService.post<Subscription>(this.basePath, data);
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string) {
    return apiService.get<Subscription>(`${this.basePath}/${subscriptionId}`);
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, data: SubscriptionUpdate) {
    return apiService.put<Subscription>(`${this.basePath}/${subscriptionId}`, data);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, data: SubscriptionCancel) {
    return apiService.post<Subscription>(`${this.basePath}/${subscriptionId}/cancel`, data);
  }

  /**
   * Renew subscription
   */
  async renewSubscription(subscriptionId: string, data: SubscriptionRenew) {
    return apiService.post<Subscription>(`${this.basePath}/${subscriptionId}/renew`, data);
  }

  /**
   * Get provider's active subscription
   */
  async getProviderSubscription(providerId: string) {
    return apiService.get<Subscription>(`${this.basePath}/provider/${providerId}`);
  }

  /**
   * Get expiring subscriptions
   */
  async getExpiringSubscriptions(days: number = 30) {
    return apiService.get<{ expiring_subscriptions: ExpiringSubscription[]; total: number; days_threshold: number }>(
      `${this.basePath}/expiring`,
      { days }
    );
  }

  // ==================== PAYMENT MANAGEMENT ====================

  /**
   * Get payment statistics
   */
  async getPaymentStatistics() {
    return apiService.get<PaymentStatistics>(`${this.basePath}/statistics/payments`);
  }

  /**
   * Get subscription payment history
   */
  async getSubscriptionPayments(subscriptionId: string, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<SubscriptionPayment>(
      `${this.basePath}/${subscriptionId}/payments`,
      params
    );
  }

  /**
   * Create subscription payment
   */
  async createSubscriptionPayment(data: SubscriptionPaymentCreate) {
    return apiService.post<SubscriptionPayment>(`${this.basePath}/payments`, data);
  }

  /**
   * Retry failed payment
   */
  async retryFailedPayment(paymentId: string, data: SubscriptionRetryPayment) {
    return apiService.post<SubscriptionPayment>(`${this.basePath}/payments/${paymentId}/retry`, data);
  }
}

export const subscriptionsService = new SubscriptionsService();
