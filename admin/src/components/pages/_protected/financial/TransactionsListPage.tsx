import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { financialService } from '@/services/api';
import type {
  FinancialTransaction,
  FinancialTransactionFilters,
  TransactionType,
  TransactionStatus,
  UserType,
} from '@/types/api.types';
import type { TableColumn } from '@/types';

export function TransactionsListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FinancialTransactionFilters>({
    page: 1,
    size: 50,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch transactions
  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['financial', 'transactions', filters],
    queryFn: async () => {
      const response = await financialService.searchTransactions(filters);
      return response.data;
    },
  });

  const transactions = transactionsData?.items || [];
  const metadata = transactionsData?.metadata;

  const handleFilterChange = (key: keyof FinancialTransactionFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = async () => {
    try {
      const blob = await financialService.exportTransactions({
        format: 'csv',
        ...filters,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const variants: Record<TransactionStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
      completed: 'success',
      failed: 'error',
      pending: 'warning',
      processing: 'info',
      cancelled: 'default',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTransactionTypeBadge = (type: TransactionType) => {
    const colors: Record<TransactionType, string> = {
      payment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      refund: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      commission: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      withdrawal: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      deposit: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      transfer: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      adjustment: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>
        {type}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: TableColumn<FinancialTransaction>[] = [
    {
      key: 'transaction_id',
      title: 'Transaction ID',
      render: (transaction) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(transaction.status)}
          <span className="font-mono text-sm">{transaction.transaction_id.slice(0, 8)}...</span>
        </div>
      ),
    },
    {
      key: 'transaction_type',
      title: 'Type',
      render: (transaction) => getTransactionTypeBadge(transaction.transaction_type),
    },
    {
      key: 'user_type',
      title: 'User',
      render: (transaction) => (
        <div>
          <div className="text-sm font-medium">{transaction.user_type}</div>
          <div className="text-xs text-gray-500">{transaction.user_id.slice(0, 8)}...</div>
        </div>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (transaction) => (
        <div className="text-right">
          <div className="font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</div>
          {transaction.commission_amount && (
            <div className="text-xs text-gray-500">
              Commission: {formatCurrency(transaction.commission_amount, transaction.currency)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (transaction) => getStatusBadge(transaction.status),
    },
    {
      key: 'created_at',
      title: 'Date',
      render: (transaction) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(transaction.created_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (transaction) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: `/financial/transactions/${transaction.id}` })}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse and manage all financial transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              placeholder="Search by transaction ID, user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Transaction Type Filter */}
          <Select
            value={filters.transaction_type || 'all'}
            onChange={(e) =>
              handleFilterChange(
                'transaction_type',
                e.target.value === 'all' ? undefined : (e.target.value as TransactionType)
              )
            }
          >
            <option value="all">All Types</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
            <option value="commission">Commission</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="deposit">Deposit</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onChange={(e) =>
              handleFilterChange('status', e.target.value === 'all' ? undefined : (e.target.value as TransactionStatus))
            }
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          {/* User Type Filter */}
          <Select
            value={filters.user_type || 'all'}
            onChange={(e) =>
              handleFilterChange('user_type', e.target.value === 'all' ? undefined : (e.target.value as UserType))
            }
          >
            <option value="all">All Users</option>
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </Select>

          {/* Date Range */}
          <Input
            type="date"
            placeholder="Start Date"
            value={filters.start_date || ''}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
          />
          <Input
            type="date"
            placeholder="End Date"
            value={filters.end_date || ''}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
          />

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setFilters({ page: 1, size: 50 });
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Results</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {metadata?.total_items.toLocaleString() || '0'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {transactions.filter((t) => t.status === 'completed').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {transactions.filter((t) => t.status === 'pending').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {transactions.filter((t) => t.status === 'failed').length}
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <EnhancedDataTable
            data={transactions}
            columns={columns}
            pagination={{
              currentPage: metadata?.page || 1,
              totalPages: metadata?.total_pages || 1,
              pageSize: metadata?.page_size || 50,
              totalItems: metadata?.total_items || 0,
              onPageChange: handlePageChange,
            }}
            isLoading={isLoading}
            emptyMessage="No transactions found"
          />
        )}
      </Card>
    </div>
  );
}
