import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  CreditCard,
  Users,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Pause,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { subscriptionsService } from '@/services/api';

export function SubscriptionsDashboard() {
  const navigate = useNavigate();

  // Fetch subscription statistics
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['subscriptions', 'statistics'],
    queryFn: async () => {
      const response = await subscriptionsService.getSubscriptionStatistics();
      return response.data;
    },
  });

  // Fetch payment statistics
  const { data: paymentStats, isLoading: loadingPayments } = useQuery({
    queryKey: ['subscriptions', 'payments', 'statistics'],
    queryFn: async () => {
      const response = await subscriptionsService.getPaymentStatistics();
      return response.data;
    },
  });

  // Fetch expiring subscriptions
  const { data: expiringData } = useQuery({
    queryKey: ['subscriptions', 'expiring', 30],
    queryFn: async () => {
      const response = await subscriptionsService.getExpiringSubscriptions(30);
      return response.data;
    },
  });

  if (loadingStats || loadingPayments) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor subscriptions, billing, and revenue metrics
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/subscriptions/create' })}>
          <CreditCard className="w-4 h-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(stats?.total_subscriptions || 0)}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats?.active_subscriptions || 0} active
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">MRR</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats?.total_mrr || 0)}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Monthly recurring
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ARR</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats?.total_arr || 0)}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Annual recurring
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Subscription</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats?.avg_subscription_value || 0)}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Per subscription
              </div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Subscriptions</h3>
            <Badge variant="success">{stats?.active_subscriptions || 0}</Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">Currently active and billing</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => navigate({ to: '/subscriptions/list', search: { status: 'active' } })}
          >
            View Active
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expired</h3>
            <Badge variant="error">{stats?.expired_subscriptions || 0}</Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm">Subscriptions that ended</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => navigate({ to: '/subscriptions/list', search: { status: 'expired' } })}
          >
            View Expired
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Failed</h3>
            <Badge variant="warning">{stats?.payment_failed_subscriptions || 0}</Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">Requires attention</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => navigate({ to: '/subscriptions/list', search: { status: 'payment_failed' } })}
          >
            View Failed
          </Button>
        </Card>
      </div>

      {/* Subscriptions by Plan */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subscriptions by Plan
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats?.subscriptions_by_plan || {}).map(([plan, count]) => (
            <div key={plan} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {plan}
              </span>
              <Badge variant="info">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Rate</p>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(stats?.churn_rate || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Renewal Rate</p>
            <RefreshCw className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(stats?.renewal_rate || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring (30d)</p>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats?.subscriptions_expiring_30_days || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring (7d)</p>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats?.subscriptions_expiring_7_days || 0)}
          </p>
        </Card>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(paymentStats?.total_revenue || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(paymentStats?.payment_success_rate || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Payments</p>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(paymentStats?.failed_payments || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Payment</p>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(paymentStats?.avg_payment_amount || 0)}
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/subscriptions/list' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">All Subscriptions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage subscriptions</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/subscriptions/expiring' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Expiring Soon</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {expiringData?.total || 0} subscriptions expiring
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/subscriptions/payments' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Payment History</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View all subscription payments</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
