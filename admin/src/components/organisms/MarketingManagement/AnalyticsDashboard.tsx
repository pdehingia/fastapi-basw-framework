/**
 * Marketing Analytics Dashboard
 * Comprehensive analytics view with charts, metrics, and performance tracking
 */

import { useState, useMemo } from 'react';
import { Card, Modal } from '@/components/molecules';
import { Button, Heading } from '@/components/atoms';
import { 
  useMarketingAnalytics,
  useMarketingCampaigns
} from '@/hooks/api/useMarketing';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UsersIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface DateRange {
  date_from: string;
  date_to: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0]
  });
  
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  // API calls
  const { data: analyticsData, isLoading: analyticsLoading } = useMarketingAnalytics(dateRange);

  const { data: campaignsData } = useMarketingCampaigns({
    status: 'active',
    page: 1,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const campaigns = campaignsData?.data || [];

  // Calculate metrics
  const metrics = useMemo((): MetricCard[] => {
    if (!analyticsData) {
      return [
        {
          title: 'Total Budget',
          value: '$0',
          icon: <CurrencyDollarIcon className="h-6 w-6" />,
          color: 'text-green-600'
        },
        {
          title: 'Total Conversions',
          value: 0,
          icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
          color: 'text-blue-600'
        },
        {
          title: 'Active Campaigns',
          value: 0,
          icon: <ChartBarIcon className="h-6 w-6" />,
          color: 'text-indigo-600'
        },
        {
          title: 'Average ROI',
          value: '0%',
          icon: <UsersIcon className="h-6 w-6" />,
          color: 'text-orange-600'
        }
      ];
    }

    return [
      {
        title: 'Total Budget',
        value: `$${analyticsData.overview.total_budget.toLocaleString()}`,
        icon: <CurrencyDollarIcon className="h-6 w-6" />,
        color: 'text-green-600'
      },
      {
        title: 'Total Spent',
        value: `$${analyticsData.overview.total_spent.toLocaleString()}`,
        icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
        color: 'text-blue-600'
      },
      {
        title: 'Active Campaigns',
        value: analyticsData.overview.active_campaigns,
        icon: <ChartBarIcon className="h-6 w-6" />,
        color: 'text-indigo-600'
      },
      {
        title: 'Average ROI',
        value: `${analyticsData.overview.avg_roi.toFixed(1)}%`,
        changeType: analyticsData.overview.avg_roi >= 0 ? 'increase' : 'decrease',
        icon: <UsersIcon className="h-6 w-6" />,
        color: 'text-orange-600'
      }
    ];
  }, [analyticsData]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleExportClick = () => {
    // Simulate export functionality
    const exportData = {
      dateRange,
      campaigns: campaigns.length,
      analytics: analyticsData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-${dateRange.date_from}-${dateRange.date_to}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading size="large" className="text-gray-900">
            Marketing Analytics
          </Heading>
          <p className="text-gray-600 mt-1">
            Performance insights and campaign analytics
          </p>
        </div>
        
        <Button
          variant="secondary"
          onClick={() => setShowExportModal(true)}
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.date_from}
                onChange={(e) => setDateRange(prev => ({ ...prev, date_from: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.date_to}
                onChange={(e) => setDateRange(prev => ({ ...prev, date_to: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gray-100 ${metric.color}`}>
                  {metric.icon}
                </div>
                {metric.change !== undefined && (
                  <div className={`flex items-center text-sm ${
                    metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(metric.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Campaign Performance Table */}
      <Card>
        <div className="p-6">
          <Heading size="medium" className="mb-4">Active Campaigns</Heading>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const spentPercentage = campaign.budget > 0 
                    ? (campaign.spent / campaign.budget) * 100 
                    : 0;
                      
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {campaign.target_audience.replace('_', ' ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${campaign.budget.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          ${campaign.spent.toLocaleString()}
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full" 
                              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>CTR: {campaign.metrics.ctr.toFixed(2)}%</div>
                          <div className="text-xs text-gray-500">
                            {campaign.metrics.conversions} conversions
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaign data</h3>
              <p className="mt-1 text-sm text-gray-500">
                No campaigns found for the selected date range.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Channel Performance */}
      {analyticsData && analyticsData.campaign_performance?.by_channel && Object.keys(analyticsData.campaign_performance.by_channel).length > 0 && (
        <Card>
          <div className="p-6">
            <Heading size="medium" className="mb-4">Channel Performance</Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyticsData.campaign_performance.by_channel).map(([channelName, channelData]: [string, any]) => (
                <div key={channelName} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 capitalize mb-2">
                    {channelName.replace('_', ' ')}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Impressions: {channelData.impressions?.toLocaleString() || 0}</div>
                    <div>Clicks: {channelData.clicks?.toLocaleString() || 0}</div>
                    <div>Conversions: {channelData.conversions?.toLocaleString() || 0}</div>
                    <div>ROI: {channelData.roi?.toFixed(2) || '0.00'}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Analytics Report"
          size="medium"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Export your analytics data for the selected date range.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm">
                <div><strong>Date Range:</strong> {formatDate(dateRange.date_from)} - {formatDate(dateRange.date_to)}</div>
                <div><strong>Campaigns:</strong> {campaigns.length} active</div>
                {analyticsData && (
                  <div><strong>Total Budget:</strong> ${analyticsData.overview.total_budget.toLocaleString()}</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExportClick}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {analyticsLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading analytics data...</p>
        </div>
      )}
    </div>
  );
};