/**
 * Financial Management API Service
 * Comprehensive financial operations including transactions, wallets, bank accounts, and earnings
 */

import { apiService } from './base';
import type {
  
  PaginatedResponse,
  FinancialTransaction,
  FinancialTransactionFilters,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  BulkTransactionRequest,
  BulkTransactionResponse,
  BankAccount,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
  WalletTransaction,
  CreateWalletTransactionRequest,
  ProviderEarnings,
  MonthlyEarnings,
  TopEarner,
  FinancialStatistics,
  WalletStatistics,
  TransactionStatistics,
  QueryParams,
  UserType,
} from '@/types/api.types';

const BASE_PATH = '/api/admin/v1/business-operations/financial';

export class FinancialService {
  // ==================== TRANSACTION MANAGEMENT ====================

  /**
   * Create a new financial transaction
   */
  async createTransaction(data: CreateTransactionRequest): Promise<FinancialTransaction> {
    return await apiService.post<FinancialTransaction>(`${BASE_PATH}/transactions`, data);
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<FinancialTransaction> {
    return await apiService.get<FinancialTransaction>(`${BASE_PATH}/transactions/${transactionId}`);
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    transactionId: string,
    data: UpdateTransactionRequest
  ): Promise<FinancialTransaction> {
    return await apiService.put<FinancialTransaction>(`${BASE_PATH}/transactions/${transactionId}`, data);
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    return await apiService.delete<void>(`${BASE_PATH}/transactions/${transactionId}`);
  }

  /**
   * Search transactions with advanced filters
   */
  async searchTransactions(
    filters: FinancialTransactionFilters & QueryParams = {}
  ): Promise<PaginatedResponse<FinancialTransaction>> {
    return await apiService.get<PaginatedResponse<FinancialTransaction>>(`${BASE_PATH}/transactions`, filters);
  }

  /**
   * Create multiple transactions in bulk
   */
  async bulkCreateTransactions(data: BulkTransactionRequest): Promise<BulkTransactionResponse> {
    return await apiService.post<BulkTransactionResponse>(`${BASE_PATH}/transactions/bulk`, data);
  }

  // ==================== BANK ACCOUNT MANAGEMENT ====================

  /**
   * Create a new bank account
   */
  async createBankAccount(data: CreateBankAccountRequest): Promise<BankAccount> {
    return await apiService.post<BankAccount>(`${BASE_PATH}/bank-accounts`, data);
  }

  /**
   * Get bank account by ID
   */
  async getBankAccount(accountId: string): Promise<BankAccount> {
    return await apiService.get<BankAccount>(`${BASE_PATH}/bank-accounts/${accountId}`);
  }

  /**
   * Update bank account
   */
  async updateBankAccount(
    accountId: string,
    data: UpdateBankAccountRequest
  ): Promise<BankAccount> {
    return await apiService.put<BankAccount>(`${BASE_PATH}/bank-accounts/${accountId}`, data);
  }

  /**
   * Delete bank account
   */
  async deleteBankAccount(accountId: string): Promise<void> {
    return await apiService.delete<void>(`${BASE_PATH}/bank-accounts/${accountId}`);
  }

  /**
   * Get all bank accounts for a user
   */
  async getUserBankAccounts(userId: string, userType: UserType): Promise<BankAccount[]> {
    return await apiService.get<BankAccount[]>(`${BASE_PATH}/users/${userId}/bank-accounts`, { user_type: userType });
  }

  // ==================== WALLET MANAGEMENT ====================

  /**
   * Create a new wallet
   */
  async createWallet(data: CreateWalletRequest): Promise<Wallet> {
    return await apiService.post<Wallet>(`${BASE_PATH}/wallets`, data);
  }

  /**
   * Get wallet by ID
   */
  async getWallet(walletId: string): Promise<Wallet> {
    return await apiService.get<Wallet>(`${BASE_PATH}/wallets/${walletId}`);
  }

  /**
   * Get wallet for a specific user
   */
  async getUserWallet(userId: string, userType: UserType): Promise<Wallet> {
    return await apiService.get<Wallet>(`${BASE_PATH}/users/${userId}/wallet`, { user_type: userType });
  }

  /**
   * Update wallet
   */
  async updateWallet(walletId: string, data: UpdateWalletRequest): Promise<Wallet> {
    return await apiService.put<Wallet>(`${BASE_PATH}/wallets/${walletId}`, data);
  }

  // ==================== WALLET TRANSACTIONS ====================

  /**
   * Create a new wallet transaction
   */
  async createWalletTransaction(data: CreateWalletTransactionRequest): Promise<WalletTransaction> {
    return await apiService.post<WalletTransaction>(`${BASE_PATH}/wallet-transactions`, data);
  }

  /**
   * Get wallet transactions with pagination
   */
  async getWalletTransactions(
    walletId: string,
    params: QueryParams = {}
  ): Promise<PaginatedResponse<WalletTransaction>> {
    return await apiService.get<PaginatedResponse<WalletTransaction>>(
      `${BASE_PATH}/wallets/${walletId}/transactions`,
      params
    );
  }

  // ==================== EARNINGS & ANALYTICS ====================

  /**
   * Get comprehensive earnings summary for a provider
   */
  async getProviderEarnings(
    providerId: string,
    params: { start_date?: string; end_date?: string } = {}
  ): Promise<ProviderEarnings> {
    return await apiService.get<ProviderEarnings>(`${BASE_PATH}/providers/${providerId}/earnings`, params);
  }

  /**
   * Get monthly earnings trend for a provider
   */
  async getMonthlyEarningsTrend(
    providerId: string,
    months: number = 12
  ): Promise<MonthlyEarnings[]> {
    return await apiService.get<MonthlyEarnings[]>(`${BASE_PATH}/providers/${providerId}/earnings/trend`, {
      months,
    });
  }

  /**
   * Get top earning providers
   */
  async getTopEarners(params: {
    limit?: number;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<TopEarner[]> {
    return await apiService.get<TopEarner[]>(`${BASE_PATH}/providers/top-earners`, params);
  }

  // ==================== STATISTICS & REPORTS ====================

  /**
   * Get comprehensive financial statistics overview
   */
  async getFinancialStatistics(): Promise<FinancialStatistics> {
    return await apiService.get<FinancialStatistics>(`${BASE_PATH}/statistics/overview`);
  }

  /**
   * Get wallet statistics overview
   */
  async getWalletStatistics(): Promise<WalletStatistics> {
    return await apiService.get<WalletStatistics>(`${BASE_PATH}/statistics/wallets`);
  }

  /**
   * Get transaction statistics overview
   */
  async getTransactionStatistics(): Promise<TransactionStatistics> {
    return await apiService.get<TransactionStatistics>(`${BASE_PATH}/statistics/transactions`);
  }

  // ==================== ADVANCED ANALYTICS ====================

  /**
   * Get daily revenue analytics
   */
  async getDailyRevenueAnalytics(days: number = 30): Promise<any> {
    return await apiService.get<any>(`${BASE_PATH}/analytics/daily-revenue`, { days });
  }

  /**
   * Get provider performance analytics
   */
  async getProviderPerformance(params: {
    provider_id?: string;
    period?: 'week' | 'month' | 'quarter' | 'year';
  } = {}): Promise<any> {
    return await apiService.get<any>(`${BASE_PATH}/analytics/provider-performance`, params);
  }

  /**
   * Get commission breakdown analytics
   */
  async getCommissionBreakdown(params: {
    start_date?: string;
    end_date?: string;
  } = {}): Promise<any> {
    return await apiService.get<any>(`${BASE_PATH}/analytics/commission-breakdown`, params);
  }

  // ==================== EXPORT & REPORTING ====================

  /**
   * Export transactions report
   */
  async exportTransactions(params: {
    format?: 'csv' | 'excel' | 'pdf';
    start_date?: string;
    end_date?: string;
    user_type?: UserType;
  } = {}): Promise<Blob> {
    return await apiService.getBlob(`${BASE_PATH}/exports/transactions`, params);
  }

  /**
   * Export earnings report
   */
  async exportEarnings(params: {
    format?: 'csv' | 'excel' | 'pdf';
    provider_id?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<Blob> {
    return await apiService.getBlob(`${BASE_PATH}/exports/earnings`, params);
  }

  // ==================== ADMINISTRATIVE OPERATIONS ====================

  /**
   * Reconcile wallet balances with transaction history
   */
  async reconcileWallets(): Promise<any> {
    return await apiService.post<any>(`${BASE_PATH}/admin/reconcile-wallets`, {});
  }

  /**
   * Generate user financial statements
   */
  async generateUserStatements(params: {
    user_id: string;
    month: number;
    year: number;
  }): Promise<any> {
    return await apiService.post<any>(`${BASE_PATH}/admin/generate-statements`, params);
  }

  /**
   * Health check for financial management service
   */
  async healthCheck(): Promise<any> {
    return await apiService.get<any>(`${BASE_PATH}/health`);
  }
}

// Export singleton instance
export const financialService = new FinancialService();
