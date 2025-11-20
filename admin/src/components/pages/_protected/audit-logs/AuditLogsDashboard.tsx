import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { auditLogsService } from '@/services/api';

export function AuditLogsDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Fetch all audit log statistics
  const { data: allStats, isLoading } = useQuery({
    queryKey: ['audit-logs', 'all-statistics'],
    queryFn: async () => {
      const response = await auditLogsService.getAllStatistics();
      return response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const activityStats = allStats?.activity;
  const customerStats = allStats?.customer;
  const providerStats = allStats?.provider;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and track all system activities, customer actions, and provider operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={selectedPeriod === 'today' ? 'primary' : 'outline'}
            onClick={() => setSelectedPeriod('today')}
            size="sm"
          >
            Today
          </Button>
          <Button
            variant={selectedPeriod === 'week' ? 'primary' : 'outline'}
            onClick={() => setSelectedPeriod('week')}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'primary' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
            size="sm"
          >
            Month
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Activity Logs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(activityStats?.total_logs || 0)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(activityStats?.unique_users || 0)} users
                </span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Customer Audits
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(customerStats?.total_logs || 0)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.keys(customerStats?.by_action || {}).length} actions
                </span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Provider Audits
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(providerStats?.total_logs || 0)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.keys(providerStats?.by_entity || {}).length} entities
                </span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(activityStats?.unique_sessions || 0)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top User Types (Activity) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Activity by User Type
          </h3>
          <div className="space-y-3">
            {Object.entries(activityStats?.by_user_type || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      type === 'admin'
                        ? 'error'
                        : type === 'provider'
                        ? 'success'
                        : 'info'
                    }
                  >
                    {type}
                  </Badge>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(count as number)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Customer Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            Top Customer Actions
          </h3>
          <div className="space-y-3">
            {Object.entries(customerStats?.by_action || {})
              .slice(0, 5)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatNumber(count as number)}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        {/* Top Provider Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            Top Provider Actions
          </h3>
          <div className="space-y-3">
            {Object.entries(providerStats?.by_action || {})
              .slice(0, 5)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatNumber(count as number)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Activity Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Activity Trend (Last 30 Days)
        </h3>
        <div className="h-64 flex items-end gap-2">
          {activityStats?.logs_per_day?.slice(-30).map((day, index) => {
            const maxCount = Math.max(...(activityStats?.logs_per_day?.map((d) => d.count) || [1]));
            const height = (day.count / maxCount) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${day.date}: ${day.count} logs`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 rotate-45 origin-left">
                  {formatDate(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/audit-logs/activity' })}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Activity Logs</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View detailed user activities</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/audit-logs/customer' })}>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Customer Audits</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track customer actions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/audit-logs/provider' })}>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Provider Audits</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor provider operations</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
