import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Mail,
  MessageSquare,
  Send,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { campaignsService } from '@/services/api';

export function CampaignsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

  // Fetch email statistics
  const { data: emailStats, isLoading: loadingEmail } = useQuery({
    queryKey: ['campaigns', 'email', 'statistics'],
    queryFn: async () => {
      const response = await campaignsService.getEmailStatistics();
      return response.data;
    },
  });

  // Fetch SMS statistics
  const { data: smsStats, isLoading: loadingSMS } = useQuery({
    queryKey: ['campaigns', 'sms', 'statistics'],
    queryFn: async () => {
      const response = await campaignsService.getSMSStatistics();
      return response.data;
    },
  });

  if (loadingEmail || loadingSMS) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaign Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage email and SMS marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: '/campaigns/email/create' })}>
            <Mail className="w-4 h-4 mr-2" />
            New Email Campaign
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: '/campaigns/sms/create' })}>
            <MessageSquare className="w-4 h-4 mr-2" />
            New SMS Campaign
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'email'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Email Campaigns
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'sms'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          SMS Campaigns
        </button>
      </div>

      {/* Email Campaign Statistics */}
      {activeTab === 'email' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatNumber(emailStats?.total_campaigns || 0)}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {emailStats?.sent_campaigns || 0} sent
                  </div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recipients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatNumber(emailStats?.total_recipients || 0)}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {formatNumber(emailStats?.total_sent || 0)} emails sent
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatPercentage(emailStats?.average_open_rate || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formatNumber(emailStats?.total_opened || 0)} opens
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatPercentage(emailStats?.average_click_rate || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400">
                    <Send className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formatNumber(emailStats?.total_clicked || 0)} clicks
                    </span>
                  </div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                  <Send className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Email Campaign Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Draft Campaigns</h3>
                <Badge variant="default">{emailStats?.draft_campaigns || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Campaigns in draft status</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate({ to: '/campaigns/email/list', search: { status: 'draft' } })}
              >
                View Drafts
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Campaigns</h3>
                <Badge variant="info">{emailStats?.scheduled_campaigns || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Campaigns scheduled to send</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate({ to: '/campaigns/email/list', search: { status: 'scheduled' } })}
              >
                View Scheduled
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sent Campaigns</h3>
                <Badge variant="success">{emailStats?.sent_campaigns || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Campaigns successfully sent</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate({ to: '/campaigns/email/list', search: { status: 'sent' } })}
              >
                View Sent
              </Button>
            </Card>
          </div>

          {/* Email Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(emailStats?.total_delivered || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Opened</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(emailStats?.total_opened || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Clicked</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(emailStats?.total_clicked || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Unsubscribed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(emailStats?.total_unsubscribed || 0)}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* SMS Campaign Statistics */}
      {activeTab === 'sms' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatNumber(smsStats?.total_campaigns || 0)}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {smsStats?.sent_campaigns || 0} sent
                  </div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recipients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatNumber(smsStats?.total_recipients || 0)}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {formatNumber(smsStats?.total_sent || 0)} messages sent
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatPercentage(smsStats?.average_delivery_rate || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formatNumber(smsStats?.total_delivered || 0)} delivered
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatNumber(smsStats?.total_failed || 0)}
                  </p>
                  <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Failed deliveries
                  </div>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* SMS Campaign Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Draft Campaigns</h3>
                <Badge variant="default">{smsStats?.draft_campaigns || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Campaigns in draft status</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate({ to: '/campaigns/sms/list', search: { status: 'draft' } })}
              >
                View Drafts
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Campaigns</h3>
                <Badge variant="info">{smsStats?.scheduled_campaigns || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Campaigns scheduled to send</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate({ to: '/campaigns/sms/list', search: { status: 'scheduled' } })}
              >
                View Scheduled
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sent Campaigns</h3>
                <Badge variant="success">{smsStats?.sent_campaigns || 0}</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Campaigns successfully sent</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate({ to: '/campaigns/sms/list', search: { status: 'sent' } })}
              >
                View Sent
              </Button>
            </Card>
          </div>

          {/* SMS Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(smsStats?.total_sent || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(smsStats?.total_delivered || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(smsStats?.total_failed || 0)}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/campaigns/email/list' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Manage Email Campaigns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all email campaigns</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/campaigns/sms/list' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Manage SMS Campaigns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all SMS campaigns</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
