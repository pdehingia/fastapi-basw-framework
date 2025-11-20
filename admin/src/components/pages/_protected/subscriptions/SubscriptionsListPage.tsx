import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  XCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  Pause,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { subscriptionsService } from '@/services/api';
import type { Subscription, SubscriptionFilters, SubscriptionStatus, SubscriptionPlan } from '@/types/api.types';

export function SubscriptionsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SubscriptionFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading, refetch } = useQuery({
    queryKey: ['subscriptions', 'list', filters, page],
    queryFn: async () => {
      const response = await subscriptionsService.getSubscriptions(
        { ...filters, search: searchQuery },
        { page, size: 50 }
      );
      return response.data;
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) => {
      return subscriptionsService.cancelSubscription(subscriptionId, {
        cancel_immediately: false,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleFilterChange = (key: keyof SubscriptionFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log('Export subscriptions with filters:', filters);
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const statusConfig = {
      active: { variant: 'success' as const, icon: CheckCircle, text: 'Active' },
      cancelled: { variant: 'error' as const, icon: XCircle, text: 'Cancelled' },
      expired: { variant: 'default' as const, icon: Clock, text: 'Expired' },
      paused: { variant: 'warning' as const, icon: Pause, text: 'Paused' },
      payment_failed: { variant: 'error' as const, icon: AlertTriangle, text: 'Payment Failed' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    const planColors = {
      premium: 'info' as const,
      elite: 'success' as const,
    };

    return (
      <Badge variant={planColors[plan]} className="capitalize">
        {plan}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'provider',
      label: 'Provider',
      render: (subscription: Subscription) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {subscription.provider_name || 'N/A'}
          </div>
          {subscription.provider_email && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {subscription.provider_email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (subscription: Subscription) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{subscription.plan_name}</div>
          {getPlanBadge(subscription.plan_type)}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (subscription: Subscription) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(subscription.plan_price)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {subscription.billing_cycle}
          </div>
        </div>
      ),
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (subscription: Subscription) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {subscription.commission_rate}%
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Current Period',
      render: (subscription: Subscription) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {new Date(subscription.current_period_start).toLocaleDateString()}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            to {new Date(subscription.current_period_end).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'expiry',
      label: 'Expiry',
      render: (subscription: Subscription) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {new Date(subscription.end_date).toLocaleDateString()}
          </div>
          {subscription.days_remaining !== undefined && (
            <div
              className={`${
                subscription.days_remaining <= 7
                  ? 'text-red-600 dark:text-red-400'
                  : subscription.days_remaining <= 30
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {subscription.days_remaining} days left
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (subscription: Subscription) => (
        <div className="space-y-1">
          {getStatusBadge(subscription.status)}
          {subscription.auto_renew && (
            <Badge variant="info" className="text-xs">
              Auto-renew
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (subscription: Subscription) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/subscriptions/${subscription.id}` })}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {subscription.status === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                cancelMutation.mutate({
                  subscriptionId: subscription.id,
                  reason: 'Cancelled by admin',
                })
              }
              disabled={cancelMutation.isPending}
            >
              <XCircle className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const subscriptions = subscriptionsData?.items || [];
  const metadata = subscriptionsData?.metadata;

  // Calculate summary statistics
  const totalSubscriptions = metadata?.total || 0;
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;
  const expiringSubscriptions = subscriptions.filter(
    (s) => s.is_expiring_soon && s.status === 'active'
  ).length;
  const failedPayments = subscriptions.filter((s) => s.status === 'payment_failed').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-500" />
            Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage provider subscriptions and billing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate({ to: '/subscriptions/create' })}>
            <CreditCard className="w-4 h-4 mr-2" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalSubscriptions}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeSubscriptions}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{expiringSubscriptions}</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{failedPayments}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={filters.plan_type || ''}
            onChange={(e) => handleFilterChange('plan_type', e.target.value || undefined)}
            className="w-[150px]"
          >
            <option value="">All Plans</option>
            <option value="premium">Premium</option>
            <option value="elite">Elite</option>
          </Select>
          <Select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-[150px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="paused">Paused</option>
            <option value="payment_failed">Payment Failed</option>
          </Select>
          <Select
            value={filters.auto_renew?.toString() || ''}
            onChange={(e) =>
              handleFilterChange('auto_renew', e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-[150px]"
          >
            <option value="">All Auto-renew</option>
            <option value="true">Auto-renew On</option>
            <option value="false">Auto-renew Off</option>
          </Select>
          <Select
            value={filters.expiring_in_days?.toString() || ''}
            onChange={(e) =>
              handleFilterChange('expiring_in_days', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="w-[150px]"
          >
            <option value="">All Expiry</option>
            <option value="7">Expiring in 7 days</option>
            <option value="30">Expiring in 30 days</option>
            <option value="90">Expiring in 90 days</option>
          </Select>
          <Button variant="outline" onClick={handleClearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <EnhancedDataTable
          data={subscriptions}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No subscriptions found"
        />
        {metadata && metadata.total > metadata.size && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(metadata.page - 1) * metadata.size + 1} to{' '}
              {Math.min(metadata.page * metadata.size, metadata.total)} of {metadata.total} subscriptions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= metadata.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
