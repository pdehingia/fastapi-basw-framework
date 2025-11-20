/**
 * Platform Analytics Page
 * Comprehensive platform-wide analytics, metrics, and insights
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { analyticsService } from '@/services/api';
import { toast } from '@/services/toast';

const PlatformAnalyticsPage = () => {
  // State
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [trendMetric, setTrendMetric] = useState('revenue');

  // Fetch platform analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['platform-analytics', period],
    queryFn: () => analyticsService.platform.getAnalytics({ period }),
  });

  // Fetch platform summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['platform-summary', period],
    queryFn: () => analyticsService.platform.getSummary({ period }),
  });

  // Fetch trends
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['platform-trends', trendMetric, period],
    queryFn: () =>
      analyticsService.platform.getTrends({
        metric: trendMetric,
        period: period === 'quarter' || period === 'year' ? 'month' : 'day',
      }),
  });

  const analytics = analyticsData?.data;
  const summary = summaryData?.data;
  const trends = trendsData?.data;

  // Handle export
  const handleExport = async () => {
    try {
      const response = await analyticsService.platform.export({
        report_type: 'platform_overview',
        format: 'xlsx',
      });
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
        toast.success('Export started successfully');
      }
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  // Overview metrics
  const overviewMetrics = [
    {
      title: 'Total Users',
      value: analytics?.overview?.total_users?.toLocaleString() || '0',
      change: `+${analytics?.overview?.growth_rate?.toFixed(1) || 0}%`,
      trend: 'up' as const,
      icon: UsersIcon,
      color: 'blue',
    },
    {
      title: 'Total Bookings',
      value: analytics?.overview?.total_bookings?.toLocaleString() || '0',
      change: '+18.3%',
      trend: 'up' as const,
      icon: ShoppingBagIcon,
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: `$${analytics?.overview?.total_revenue?.toLocaleString() || 0}`,
      change: '+24.5%',
      trend: 'up' as const,
      icon: CurrencyDollarIcon,
      color: 'purple',
    },
    {
      title: 'Active Providers',
      value: analytics?.overview?.total_providers?.toLocaleString() || '0',
      change: '+12.1%',
      trend: 'up' as const,
      icon: BuildingStorefrontIcon,
      color: 'orange',
    },
  ];

  // Summary metrics
  const summaryMetrics = [
    {
      label: 'Avg Booking Value',
      value: `$${summary?.avg_booking_value?.toFixed(2) || 0}`,
    },
    {
      label: 'User Retention Rate',
      value: `${((summary?.user_retention_rate || 0) * 100).toFixed(1)}%`,
    },
    {
      label: 'Provider Satisfaction',
      value: `${((summary?.provider_satisfaction || 0) * 100).toFixed(1)}%`,
    },
    {
      label: 'Total Transactions',
      value: summary?.total_transactions?.toLocaleString() || '0',
    },
  ];

  // Top services columns
  const servicesColumns = [
    {
      key: 'rank',
      header: '#',
      render: (_: any, item: any, index: number) => (
        <div className="font-bold text-gray-400">#{index + 1}</div>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      render: (_: any, item: any) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      key: 'bookings',
      header: 'Bookings',
      render: (_: any, item: any) => (
        <div className="font-semibold">{item.count.toLocaleString()}</div>
      ),
    },
  ];

  // Top providers columns
  const providersColumns = [
    {
      key: 'rank',
      header: '#',
      render: (_: any, item: any, index: number) => (
        <div className="font-bold text-gray-400">#{index + 1}</div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (_: any, item: any) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (_: any, item: any) => (
        <div className="font-semibold text-green-600">
          ${item.revenue.toLocaleString()}
        </div>
      ),
    },
  ];

  // Popular locations columns
  const locationsColumns = [
    {
      key: 'rank',
      header: '#',
      render: (_: any, item: any, index: number) => (
        <div className="font-bold text-gray-400">#{index + 1}</div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (_: any, item: any) => (
        <div className="font-medium">{item.location}</div>
      ),
    },
    {
      key: 'bookings',
      header: 'Bookings',
      render: (_: any, item: any) => (
        <div className="font-semibold">{item.count.toLocaleString()}</div>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Platform Analytics"
      subtitle="Comprehensive platform-wide insights and performance metrics"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Analytics', path: '/analytics' },
        { label: 'Platform', path: '/analytics/platform' },
      ]}
      actions={
        <div className="flex gap-2">
          <Select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Select>
          <Button variant="secondary" onClick={handleExport} icon={ArrowDownTrayIcon}>
            Export
          </Button>
        </div>
      }
    >
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {overviewMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-sm text-gray-500">{metric.title}</Text>
                    <Heading level={3} className="mt-1">
                      {analyticsLoading ? '...' : metric.value}
                    </Heading>
                    <div className="flex items-center mt-2 space-x-1">
                      {metric.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <Text
                        className={`text-xs ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {metric.change}
                      </Text>
                    </div>
                  </div>
                  <div className={`p-3 bg-${metric.color}-100 dark:bg-${metric.color}-900/20 rounded-lg`}>
                    <Icon className={`h-8 w-8 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Summary Metrics */}
      <Card className="mb-6">
        <CardHeader>
          <Heading level={3}>Platform Summary</Heading>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {summaryMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <Text className="text-sm text-gray-500">{metric.label}</Text>
                <Heading level={3} className="mt-2">
                  {summaryLoading ? '...' : metric.value}
                </Heading>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Trends Chart */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading level={3}>Trends</Heading>
            <Select
              value={trendMetric}
              onChange={(e) => setTrendMetric(e.target.value)}
              className="w-48"
            >
              <option value="revenue">Revenue</option>
              <option value="users">Users</option>
              <option value="bookings">Bookings</option>
            </Select>
          </div>
        </CardHeader>
        <CardBody>
          {trendsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading trends...</div>
          ) : trends?.data && trends.data.length > 0 ? (
            <div className="space-y-3">
              {trends.data.map((point, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="text-sm font-medium">{point.date}</div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">{point.label || trendMetric}</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {trendMetric === 'revenue' ? `$${point.value.toLocaleString()}` : point.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No trend data available</div>
          )}
        </CardBody>
      </Card>

      {/* Top Metrics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Booked Services */}
        <Card>
          <CardHeader>
            <Heading level={3}>Top Services</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={analytics?.top_metrics?.most_booked_services || []}
              columns={servicesColumns}
              loading={analyticsLoading}
              emptyMessage="No data available"
            />
          </CardBody>
        </Card>

        {/* Top Revenue Providers */}
        <Card>
          <CardHeader>
            <Heading level={3}>Top Providers</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={analytics?.top_metrics?.top_revenue_providers || []}
              columns={providersColumns}
              loading={analyticsLoading}
              emptyMessage="No data available"
            />
          </CardBody>
        </Card>

        {/* Popular Locations */}
        <Card>
          <CardHeader>
            <Heading level={3}>Popular Locations</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={analytics?.top_metrics?.popular_locations || []}
              columns={locationsColumns}
              loading={analyticsLoading}
              emptyMessage="No data available"
            />
          </CardBody>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default PlatformAnalyticsPage;
