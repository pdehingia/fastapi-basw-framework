import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet as WalletIcon,
  Search,
  Plus,
  Eye,
  Settings,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Download,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { Modal } from '@/components/molecules/Modal';
import { EnhancedDataTable } from '@/components/organisms';
import { financialService } from '@/services/api';
import type { Wallet, WalletTransaction, UserType } from '@/types/api.types';
import type { TableColumn } from '@/types';

export function WalletManagementPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch wallet statistics
  const { data: walletStats } = useQuery({
    queryKey: ['financial', 'wallet-statistics'],
    queryFn: async () => {
      const response = await financialService.getWalletStatistics();
      return response.data;
    },
  });

  // Mock wallet list query (in real implementation, you'd have a list endpoint)
  const {
    data: walletsData,
    isLoading: loadingWallets,
    refetch: refetchWallets,
  } = useQuery({
    queryKey: ['financial', 'wallets', page],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        items: [] as Wallet[],
        metadata: {
          page: 1,
          page_size: 50,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        },
      };
    },
  });

  // Fetch wallet transactions when a wallet is selected
  const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
    queryKey: ['financial', 'wallet-transactions', selectedWallet?.id],
    queryFn: async () => {
      if (!selectedWallet) return null;
      const response = await financialService.getWalletTransactions(selectedWallet.id, { page: 1, size: 50 });
      return response.data;
    },
    enabled: !!selectedWallet && showTransactions,
  });

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

  const walletColumns: TableColumn<Wallet>[] = [
    {
      key: 'wallet_id',
      title: 'Wallet ID',
      render: (wallet) => (
        <div className="flex items-center gap-2">
          <WalletIcon className="w-4 h-4 text-purple-500" />
          <span className="font-mono text-sm">{wallet.wallet_id.slice(0, 12)}...</span>
        </div>
      ),
    },
    {
      key: 'user_type',
      title: 'User Type',
      render: (wallet) => (
        <Badge variant={wallet.user_type === 'provider' ? 'success' : 'info'}>
          {wallet.user_type}
        </Badge>
      ),
    },
    {
      key: 'balance',
      title: 'Balance',
      render: (wallet) => (
        <div>
          <div className="font-semibold">{formatCurrency(wallet.balance, wallet.currency)}</div>
          <div className="text-xs text-gray-500">
            Available: {formatCurrency(wallet.available_balance, wallet.currency)}
          </div>
        </div>
      ),
    },
    {
      key: 'pending_balance',
      title: 'Pending',
      render: (wallet) => (
        <div className="text-yellow-600 dark:text-yellow-400 font-medium">
          {formatCurrency(wallet.pending_balance, wallet.currency)}
        </div>
      ),
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (wallet) => (
        <Badge variant={wallet.is_active ? 'success' : 'default'}>
          {wallet.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'last_transaction_at',
      title: 'Last Transaction',
      render: (wallet) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {wallet.last_transaction_at ? formatDate(wallet.last_transaction_at) : 'Never'}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (wallet) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedWallet(wallet);
              setShowTransactions(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedWallet(wallet)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const transactionColumns: TableColumn<WalletTransaction>[] = [
    {
      key: 'transaction_id',
      title: 'Transaction ID',
      render: (tx) => <span className="font-mono text-sm">{tx.transaction_id.slice(0, 12)}...</span>,
    },
    {
      key: 'transaction_type',
      title: 'Type',
      render: (tx) => {
        const icon = tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
        return (
          <div className="flex items-center gap-2">
            {icon}
            <span>{tx.transaction_type}</span>
          </div>
        );
      },
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (tx) => (
        <span className={tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      key: 'balance_after',
      title: 'Balance After',
      render: (tx) => <span className="font-semibold">{formatCurrency(tx.balance_after)}</span>,
    },
    {
      key: 'description',
      title: 'Description',
      render: (tx) => <span className="text-sm text-gray-600 dark:text-gray-400">{tx.description}</span>,
    },
    {
      key: 'created_at',
      title: 'Date',
      render: (tx) => <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(tx.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user wallets and view transaction history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchWallets()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Wallets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {walletStats?.total_wallets?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <WalletIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Wallets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {walletStats?.active_wallets?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(walletStats?.total_balance || 0, walletStats?.currency)}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <WalletIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(walletStats?.total_pending_balance || 0, walletStats?.currency)}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Input
              placeholder="Search by wallet ID, user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select defaultValue="all">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">All User Types</option>
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </Card>

      {/* Wallets Table */}
      <Card>
        {loadingWallets ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <EnhancedDataTable
            data={walletsData?.items || []}
            columns={walletColumns}
            pagination={{
              currentPage: walletsData?.metadata?.page || 1,
              totalPages: walletsData?.metadata?.total_pages || 1,
              pageSize: walletsData?.metadata?.page_size || 50,
              totalItems: walletsData?.metadata?.total_items || 0,
              onPageChange: setPage,
            }}
            isLoading={loadingWallets}
            emptyMessage="No wallets found"
          />
        )}
      </Card>

      {/* Transaction History Modal */}
      {showTransactions && selectedWallet && (
        <Modal
          isOpen={showTransactions}
          onClose={() => {
            setShowTransactions(false);
            setSelectedWallet(null);
          }}
          title={`Wallet Transactions - ${selectedWallet.wallet_id.slice(0, 12)}...`}
          size="xl"
        >
          <div className="space-y-4">
            {/* Wallet Info */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Current Balance</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedWallet.balance, selectedWallet.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(selectedWallet.available_balance, selectedWallet.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(selectedWallet.pending_balance, selectedWallet.currency)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Transactions Table */}
            {loadingTransactions ? (
              <div className="flex items-center justify-center h-48">
                <Spinner size="lg" />
              </div>
            ) : (
              <EnhancedDataTable
                data={transactionsData?.items || []}
                columns={transactionColumns}
                pagination={{
                  currentPage: transactionsData?.metadata?.page || 1,
                  totalPages: transactionsData?.metadata?.total_pages || 1,
                  pageSize: transactionsData?.metadata?.page_size || 50,
                  totalItems: transactionsData?.metadata?.total_items || 0,
                  onPageChange: (p) => {},
                }}
                isLoading={loadingTransactions}
                emptyMessage="No transactions found"
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
