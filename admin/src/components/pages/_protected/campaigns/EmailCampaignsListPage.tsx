import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Mail,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { campaignsService } from '@/services/api';
import type { EmailCampaign, EmailCampaignFilters, CampaignStatus, CampaignType, TargetAudience } from '@/types/api.types';

export function EmailCampaignsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<EmailCampaignFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch email campaigns
  const { data: campaignsData, isLoading, refetch } = useQuery({
    queryKey: ['campaigns', 'email', 'list', filters, page],
    queryFn: async () => {
      const response = await campaignsService.getEmailCampaigns(filters, { page, size: 50 });
      return response.data;
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return campaignsService.deleteEmailCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'email'] });
    },
  });

  // Send campaign mutation
  const sendMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return campaignsService.sendEmailCampaign(campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'email'] });
    },
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleFilterChange = (key: keyof EmailCampaignFilters, value: any) => {
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
    console.log('Export email campaigns with filters:', filters);
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const statusConfig = {
      draft: { variant: 'default' as const, icon: Clock, text: 'Draft' },
      scheduled: { variant: 'info' as const, icon: Clock, text: 'Scheduled' },
      sending: { variant: 'warning' as const, icon: Send, text: 'Sending' },
      sent: { variant: 'success' as const, icon: CheckCircle, text: 'Sent' },
      paused: { variant: 'warning' as const, icon: Pause, text: 'Paused' },
      cancelled: { variant: 'error' as const, icon: XCircle, text: 'Cancelled' },
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

  const getTypeBadge = (type: CampaignType) => {
    return (
      <Badge variant="info" className="capitalize">
        {type}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'campaign_name',
      label: 'Campaign',
      render: (campaign: EmailCampaign) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{campaign.campaign_name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{campaign.subject_line}</div>
        </div>
      ),
    },
    {
      key: 'campaign_type',
      label: 'Type',
      render: (campaign: EmailCampaign) => getTypeBadge(campaign.campaign_type),
    },
    {
      key: 'target_audience',
      label: 'Audience',
      render: (campaign: EmailCampaign) => (
        <Badge variant="default" className="capitalize">
          {campaign.target_audience.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'recipients',
      label: 'Recipients',
      render: (campaign: EmailCampaign) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {campaign.total_recipients.toLocaleString()}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {campaign.total_sent.toLocaleString()} sent
          </div>
        </div>
      ),
    },
    {
      key: 'performance',
      label: 'Performance',
      render: (campaign: EmailCampaign) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {campaign.total_opened > 0
              ? `${((campaign.total_opened / campaign.total_sent) * 100).toFixed(1)}% opens`
              : 'N/A'}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {campaign.total_clicked > 0
              ? `${((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1)}% clicks`
              : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'campaign_status',
      label: 'Status',
      render: (campaign: EmailCampaign) => getStatusBadge(campaign.campaign_status),
    },
    {
      key: 'scheduled_at',
      label: 'Schedule',
      render: (campaign: EmailCampaign) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {campaign.scheduled_at
            ? new Date(campaign.scheduled_at).toLocaleDateString()
            : 'Not scheduled'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (campaign: EmailCampaign) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/campaigns/email/${campaign.id}` })}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {campaign.campaign_status === 'draft' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendMutation.mutate(campaign.id)}
                disabled={sendMutation.isPending}
              >
                <Send className="w-4 h-4 text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(campaign.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </>
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

  const campaigns = campaignsData?.items || [];
  const metadata = campaignsData?.metadata;

  // Calculate summary statistics
  const totalCampaigns = metadata?.total || 0;
  const draftCampaigns = campaigns.filter((c) => c.campaign_status === 'draft').length;
  const scheduledCampaigns = campaigns.filter((c) => c.campaign_status === 'scheduled').length;
  const sentCampaigns = campaigns.filter((c) => c.campaign_status === 'sent').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-8 h-8 text-blue-500" />
            Email Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor email marketing campaigns
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
          <Button onClick={() => navigate({ to: '/campaigns/email/create' })}>
            <Mail className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCampaigns}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{draftCampaigns}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{scheduledCampaigns}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{sentCampaigns}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={filters.campaign_type || ''}
            onChange={(e) => handleFilterChange('campaign_type', e.target.value || undefined)}
            className="w-[150px]"
          >
            <option value="">All Types</option>
            <option value="promotional">Promotional</option>
            <option value="newsletter">Newsletter</option>
            <option value="notification">Notification</option>
          </Select>
          <Select
            value={filters.campaign_status || ''}
            onChange={(e) => handleFilterChange('campaign_status', e.target.value || undefined)}
            className="w-[150px]"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select
            value={filters.target_audience || ''}
            onChange={(e) => handleFilterChange('target_audience', e.target.value || undefined)}
            className="w-[150px]"
          >
            <option value="">All Audiences</option>
            <option value="all_users">All Users</option>
            <option value="academies">Academies</option>
            <option value="artists">Artists</option>
            <option value="customers">Customers</option>
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

      {/* Campaigns Table */}
      <Card>
        <EnhancedDataTable
          data={campaigns}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No email campaigns found"
        />
        {metadata && metadata.total > metadata.size && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(metadata.page - 1) * metadata.size + 1} to{' '}
              {Math.min(metadata.page * metadata.size, metadata.total)} of {metadata.total} campaigns
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
