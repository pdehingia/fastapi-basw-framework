/**
 * Marketing Analytics Page
 * Comprehensive marketing analytics and performance insights
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { marketingService } from '@/services/api';

const MarketingAnalyticsPage = () => {
  // State
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [channel, setChannel] = useState<string>('');

  // Fetch analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['marketing-analytics', period],
    queryFn: () =>
      marketingService.getMarketingAnalytics({
        period,
      }),
  });

  const analytics = analyticsData?.data;

  // Overview metrics
  const overviewMetrics = [
    {
      title: 'Total Campaigns',
      value: analytics?.overview?.total_campaigns || 0,
      change: '+12.5%',
      trend: 'up' as const,
      icon: MegaphoneIcon,
    },
    {
      title: 'Total Budget',
      value: `$${(analytics?.overview?.total_budget || 0).toLocaleString()}`,
      change: '-3.2%',
      trend: 'down' as const,
      icon: CurrencyDollarIcon,
    },
    {
      title: 'Total Conversions',
      value: analytics?.overview?.total_conversions || 0,
      change: '+24.8%',
      trend: 'up' as const,
      icon: UserGroupIcon,
    },
    {
      title: 'Average ROI',
      value: `${(analytics?.overview?.avg_roi || 0).toFixed(2)}x`,
      change: '+18.3%',
      trend: 'up' as const,
      icon: ArrowTrendingUpIcon,
    },
  ];

  // Channel performance columns
  const channelColumns = [
    {
      key: 'channel',
      header: 'Channel',
      render: (_: any, item: any) => (
        <div className="font-medium capitalize">{item.channel}</div>
      ),
    },
    {
      key: 'campaigns',
      header: 'Campaigns',
      render: (_: any, item: any) => item.campaigns,
    },
    {
      key: 'impressions',
      header: 'Impressions',
      render: (_: any, item: any) => item.impressions.toLocaleString(),
    },
    {
      key: 'clicks',
      header: 'Clicks',
      render: (_: any, item: any) => item.clicks.toLocaleString(),
    },
    {
      key: 'ctr',
      header: 'CTR',
      render: (_: any, item: any) => `${item.ctr.toFixed(2)}%`,
    },
    {
      key: 'conversions',
      header: 'Conversions',
      render: (_: any, item: any) => item.conversions,
    },
    {
      key: 'spend',
      header: 'Spend',
      render: (_: any, item: any) => `$${item.spend.toLocaleString()}`,
    },
    {
      key: 'roi',
      header: 'ROI',
      render: (_: any, item: any) => (
        <div className={item.roi > 1 ? 'text-green-600 font-semibold' : 'text-red-600'}>
          {item.roi.toFixed(2)}x
        </div>
      ),
    },
  ];

  // Top campaigns columns
  const campaignColumns = [
    {
      key: 'rank',
      header: '#',
      render: (_: any, item: any, index: number) => (
        <div className="font-bold text-gray-400">#{index + 1}</div>
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      render: (_: any, item: any) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500 capitalize">{item.type}</div>
        </div>
      ),
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (_: any, item: any) => (
        <div className="space-y-1 text-sm">
          <div>Impressions: {item.metrics.impressions.toLocaleString()}</div>
          <div>Clicks: {item.metrics.clicks.toLocaleString()}</div>
          <div>Conversions: {item.metrics.conversions}</div>
        </div>
      ),
    },
    {
      key: 'ctr',
      header: 'CTR',
      render: (_: any, item: any) => `${item.metrics.ctr.toFixed(2)}%`,
    },
    {
      key: 'roi',
      header: 'ROI',
      render: (_: any, item: any) => (
        <div className={item.metrics.roi > 1 ? 'text-green-600 font-bold text-lg' : 'text-red-600 text-lg'}>
          {item.metrics.roi.toFixed(2)}x
        </div>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Marketing Analytics"
      subtitle="Comprehensive marketing performance insights and trends"
      breadcrumbs={[
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { id: 'marketing', label: 'Marketing', href: '/marketing/campaigns' },
        { id: 'analytics', label: 'Analytics', href: '/marketing/analytics', current: true },
      ]}
      secondaryActions={[
        {
          id: 'export-report',
          label: 'Export Report',
          onClick: () => console.log('Export report'),
          variant: 'secondary' as const,
        },
      ]}
    >
      {/* Period Filter */}
      <div className="mb-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Time Period:</label>
              <Select 
                value={period} 
                onChange={(value) => setPeriod(value as any)}
                options={[
                  { value: 'day', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'quarter', label: 'This Quarter' },
                  { value: 'year', label: 'This Year' },
                ]}
              />
            </div>
          </CardBody>
        </Card>
      </div>

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
                    <Heading size="lg" className="mt-1">
                      {isLoading ? '...' : metric.value}
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
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Insights */}
        {analytics?.customer_insights && (
          <Card>
            <CardHeader>
              <Heading size="lg">Customer Insights</Heading>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <Text className="text-sm text-gray-500">Acquisition Cost</Text>
                    <Heading size="md">
                      ${analytics.customer_insights.acquisition_cost.toFixed(2)}
                    </Heading>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <Text className="text-sm text-gray-500">Lifetime Value</Text>
                    <Heading size="md">
                      ${analytics.customer_insights.lifetime_value.toFixed(2)}
                    </Heading>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <Text className="text-sm text-gray-500">Retention Rate</Text>
                    <Heading size="md">
                      {(analytics.customer_insights.retention_rate * 100).toFixed(1)}%
                    </Heading>
                  </div>
                  <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Revenue Attribution */}
        {analytics?.campaign_performance?.by_channel && (
          <Card>
            <CardHeader>
              <Heading size="lg">Revenue Attribution</Heading>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(analytics.campaign_performance.by_channel).map(([channel, data]: [string, any]) => (
                  <div key={channel} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{channel}</span>
                      <span className="font-semibold">ROI: {data.roi.toFixed(2)}x</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(data.roi * 20, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Channel Performance */}
      {analytics?.campaign_performance?.by_channel && (
        <Card className="mb-6">
          <CardHeader>
            <Heading size="lg">Channel Performance</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={Object.entries(analytics.campaign_performance.by_channel).map(([channel, data]) => ({
                channel,
                ...data,
                campaigns: 0,
                spend: 0,
                ctr: data.clicks / Math.max(data.impressions, 1) * 100,
              }))}
              columns={channelColumns}
              loading={isLoading}
              emptyMessage="No channel data available"
            />
          </CardBody>
        </Card>
      )}

      {/* Top Performing Campaigns */}
      {analytics?.campaign_performance?.top_performing && (
        <Card>
          <CardHeader>
            <Heading size="lg">Top Performing Campaigns</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={analytics.campaign_performance.top_performing.slice(0, 10)}
              columns={campaignColumns}
              loading={isLoading}
              emptyMessage="No campaign data available"
            />
          </CardBody>
        </Card>
      )}
    </PageTemplate>
  );
};

export default MarketingAnalyticsPage;
