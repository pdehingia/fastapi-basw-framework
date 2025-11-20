/**
 * Marketing Dashboard Page
 * Overview of marketing campaigns, analytics, and quick actions
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  ChartBarIcon,
  MegaphoneIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { marketingService } from '@/services/api';
import type { MarketingCampaign } from '@/services/api/marketing';

const MarketingDashboard = () => {
  const navigate = useNavigate();
  const [_period, _setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');

  // Fetch marketing analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['marketing-analytics', _period],
    queryFn: () => marketingService.getMarketingAnalytics({ period: _period }),
  });

  // Fetch campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['marketing-campaigns', { page: 1 }],
    queryFn: () => marketingService.getCampaigns({ page: 1, status: 'active' }),
  });

  const analytics = analyticsData?.data;
  const campaigns = campaignsData?.data?.data || [];

  // Overview statistics
  const overviewStats = [
    {
      title: 'Total Campaigns',
      value: analytics?.overview?.total_campaigns || 0,
      icon: MegaphoneIcon,
      color: 'blue',
      change: '+8.2%',
      trend: 'up' as const,
    },
    {
      title: 'Active Campaigns',
      value: analytics?.overview?.active_campaigns || 0,
      icon: ChartBarIcon,
      color: 'green',
      change: '+12.5%',
      trend: 'up' as const,
    },
    {
      title: 'Total Budget',
      value: `$${(analytics?.overview?.total_budget || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'purple',
      change: '-3.1%',
      trend: 'down' as const,
    },
    {
      title: 'Average ROI',
      value: `${(analytics?.overview?.avg_roi || 0).toFixed(1)}x`,
      icon: ArrowTrendingUpIcon,
      color: 'orange',
      change: '+15.3%',
      trend: 'up' as const,
    },
  ];

  // Table columns for active campaigns
  const columns = [
    {
      key: 'name',
      header: 'Campaign',
      render: (_: any, campaign: MarketingCampaign) => (
        <div>
          <div className="font-medium">{campaign.name}</div>
          <div className="text-xs text-gray-500 capitalize">{campaign.type}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, campaign: MarketingCampaign) => (
        <Badge
          variant={
            campaign.status === 'active'
              ? 'success'
              : campaign.status === 'paused'
              ? 'warning'
              : 'default'
          }
          size="sm"
        >
          {campaign.status}
        </Badge>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (_: any, campaign: MarketingCampaign) => (
        <div>
          <div className="font-medium">${campaign.budget.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            Spent: ${campaign.spent.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (_: any, campaign: MarketingCampaign) => (
        <div className="space-y-1">
          <div className="text-sm">
            CTR: {campaign.metrics.ctr.toFixed(2)}%
          </div>
          <div className="text-sm">
            Conv: {campaign.metrics.conversions}
          </div>
        </div>
      ),
    },
    {
      key: 'roi',
      header: 'ROI',
      render: (_: any, campaign: MarketingCampaign) => (
        <div className="flex items-center space-x-1">
          <span className={campaign.metrics.roi > 1 ? 'text-green-600 font-semibold' : 'text-red-600'}>
            {campaign.metrics.roi.toFixed(2)}x
          </span>
          {campaign.metrics.roi > 1 ? (
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_: any, campaign: MarketingCampaign) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate({ to: `/marketing/campaigns/${campaign.id}` })}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Marketing Dashboard"
      subtitle="Manage campaigns, track performance, and analyze ROI"
      breadcrumbs={[
        { id: '1', label: 'Dashboard', href: '/dashboard' },
        { id: '2', label: 'Marketing', href: '/marketing', current: true },
      ]}
    >
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => navigate({ to: '/marketing/campaigns' })}
        >
          New Campaign
        </Button>
      </div>
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </Text>
                    <Heading size="lg" className="mt-1">
                      {analyticsLoading ? '...' : stat.value}
                    </Heading>
                    <div className="flex items-center mt-2 space-x-1">
                      {stat.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <Text
                        className={`text-xs ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </Text>
                    </div>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}>
                    <Icon className={`h-8 w-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <Heading size="lg">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate({ to: '/marketing/campaigns' })}
              >
                <MegaphoneIcon className="h-5 w-5 mr-2" />
                View All Campaigns
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate({ to: '/marketing/segments' })}
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Customer Segments
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate({ to: '/marketing/promotions' })}
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Promotions & Coupons
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate({ to: '/marketing/analytics' })}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Analytics & Reports
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Campaign Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Heading size="lg">Campaign Performance</Heading>
          </CardHeader>
          <CardBody>
            {analytics?.campaign_performance?.top_performing && (
              <div className="space-y-4">
                <div>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Top Performing
                  </Text>
                  {analytics.campaign_performance.top_performing.slice(0, 3).map((campaign: any) => (
                    <div key={campaign.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-xs text-gray-500">{campaign.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {campaign.metrics.roi.toFixed(2)}x ROI
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.metrics.conversions} conversions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Active Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading size="lg">Active Campaigns</Heading>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate({ to: '/marketing/campaigns' })}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            data={campaigns}
            columns={columns}
            loading={campaignsLoading}
            emptyMessage="No active campaigns"
          />
        </CardBody>
      </Card>

      {/* Customer Insights */}
      {analytics?.customer_insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardBody>
              <Text className="text-sm text-gray-500">Customer Acquisition Cost</Text>
              <Heading size="lg" className="mt-1">
                ${analytics.customer_insights.acquisition_cost.toFixed(2)}
              </Heading>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text className="text-sm text-gray-500">Lifetime Value</Text>
              <Heading size="lg" className="mt-1">
                ${analytics.customer_insights.lifetime_value.toFixed(2)}
              </Heading>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text className="text-sm text-gray-500">Retention Rate</Text>
              <Heading size="lg" className="mt-1">
                {(analytics.customer_insights.retention_rate * 100).toFixed(1)}%
              </Heading>
            </CardBody>
          </Card>
        </div>
      )}
    </PageTemplate>
  );
};

export default MarketingDashboard;
