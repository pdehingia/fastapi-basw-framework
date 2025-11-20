import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { financialService } from '@/services/api';
import type { FinancialStatistics, WalletStatistics, TransactionStatistics } from '@/types/api.types';

export function FinancialDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Fetch financial statistics
  const { data: financialStats, isLoading: loadingFinancial } = useQuery({
    queryKey: ['financial', 'statistics'],
    queryFn: async () => {
      const response = await financialService.getFinancialStatistics();
      return response.data;
    },
  });

  // Fetch wallet statistics
  const { data: walletStats, isLoading: loadingWallets } = useQuery({
    queryKey: ['financial', 'wallet-statistics'],
    queryFn: async () => {
      const response = await financialService.getWalletStatistics();
      return response.data;
    },
  });

  // Fetch transaction statistics
  const { data: transactionStats, isLoading: loadingTransactions } = useQuery({
    queryKey: ['financial', 'transaction-statistics'],
    queryFn: async () => {
      const response = await financialService.getTransactionStatistics();
      return response.data;
    },
  });

  const isLoading = loadingFinancial || loadingWallets || loadingTransactions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor transactions, wallets, and earnings across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/financial/transactions'}>
            View Transactions
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/financial/wallets'}>
            Manage Wallets
          </Button>
          <Button variant="primary">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(financialStats?.total_revenue || 0, financialStats?.currency)}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">
                  {formatPercentage(12.5)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">vs last period</span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Total Commission */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(financialStats?.total_commission || 0, financialStats?.currency)}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">
                  {formatPercentage(8.3)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">vs last period</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Active Wallets */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Wallets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {walletStats?.active_wallets?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total: {walletStats?.total_wallets?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Total Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {transactionStats?.total_transactions?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {transactionStats?.completed_transactions?.toLocaleString() || '0'} completed
                </span>
              </div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Breakdown */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Transaction Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {financialStats?.successful_transactions?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Volume</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(transactionStats?.total_volume || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {financialStats?.pending_transactions?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Size</p>
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(transactionStats?.average_transaction_size || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {financialStats?.failed_transactions?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Refunds</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(financialStats?.refund_amount || 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Wallet Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Wallet Overview
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(walletStats?.total_balance || 0, walletStats?.currency)}
              </p>
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(walletStats?.total_available_balance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(walletStats?.total_pending_balance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Inactive Wallets</span>
                <span className="text-sm font-medium text-gray-500">
                  {walletStats?.inactive_wallets?.toLocaleString() || '0'}
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/financial/wallets'}>
              Manage Wallets
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => window.location.href = '/financial/transactions'}
          >
            <CreditCard className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-semibold">View Transactions</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Browse all financial transactions</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => window.location.href = '/financial/earnings'}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-semibold">Provider Earnings</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">View provider earnings reports</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => alert('Reconciliation feature coming soon')}
          >
            <AlertCircle className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-semibold">Reconcile Wallets</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sync wallet balances</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}
