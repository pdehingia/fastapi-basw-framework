/**
 * Marketing Campaigns List Page
 * Manage all marketing campaigns with filtering and actions
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge, Input, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { marketingService } from '@/services/api';
import { toast } from '@/services/toast';
import type { MarketingCampaign, MarketingFilters } from '@/services/api/marketing';

const CampaignsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MarketingFilters>({
    status: undefined,
    type: undefined,
  });
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  // Fetch campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['marketing-campaigns', page, search, filters],
    queryFn: () =>
      marketingService.getCampaigns({
        page,
        page_size: 20,
        search: search || undefined,
        ...filters,
      }),
  });

  // Mutations
  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => marketingService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: () => toast.error('Failed to delete campaign'),
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: (id: string) => marketingService.pauseCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign paused');
    },
    onError: () => toast.error('Failed to pause campaign'),
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: (id: string) => marketingService.resumeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign resumed');
    },
    onError: () => toast.error('Failed to resume campaign'),
  });

  const duplicateCampaignMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      marketingService.duplicateCampaign(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign duplicated successfully');
    },
    onError: () => toast.error('Failed to duplicate campaign'),
  });

  const bulkActionMutation = useMutation({
    mutationFn: (action: 'pause' | 'resume' | 'archive') =>
      marketingService.bulkUpdateCampaigns(selectedCampaigns, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setSelectedCampaigns([]);
      toast.success('Bulk action completed');
    },
    onError: () => toast.error('Failed to complete bulk action'),
  });

  // Handlers
  const handleCampaignSelect = (id: string, isSelected: boolean) => {
    setSelectedCampaigns((prev) =>
      isSelected ? [...prev, id] : prev.filter((cid) => cid !== id)
    );
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Delete this campaign? This action cannot be undone.')) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const handleDuplicateCampaign = (campaign: MarketingCampaign) => {
    const newName = prompt('Enter name for duplicated campaign:', `${campaign.name} (Copy)`);
    if (newName) {
      duplicateCampaignMutation.mutate({ id: campaign.id, name: newName });
    }
  };

  const handleBulkAction = (action: 'pause' | 'resume' | 'archive') => {
    if (selectedCampaigns.length === 0) {
      return toast.error('Please select campaigns');
    }
    if (confirm(`${action} ${selectedCampaigns.length} campaigns?`)) {
      bulkActionMutation.mutate(action);
    }
  };

  const campaigns = campaignsData?.data?.items || [];
  const metadata = campaignsData?.data?.metadata;

  // Table columns
  const columns = [
    {
      key: 'select',
      header: '',
      render: (_: any, campaign: MarketingCampaign) => (
        <input
          type="checkbox"
          checked={selectedCampaigns.includes(campaign.id)}
          onChange={(e) => handleCampaignSelect(campaign.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      render: (_: any, campaign: MarketingCampaign) => (
        <div>
          <div className="font-medium">{campaign.name}</div>
          <div className="text-sm text-gray-500 capitalize">{campaign.type}</div>
          <div className="text-xs text-gray-400 mt-1">
            {campaign.channels.join(', ')}
          </div>
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
              : campaign.status === 'draft'
              ? 'default'
              : 'error'
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
            Spent: ${campaign.spent.toLocaleString()} (
            {((campaign.spent / campaign.budget) * 100).toFixed(0)}%)
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (_: any, campaign: MarketingCampaign) => (
        <div className="space-y-1 text-sm">
          <div>Impressions: {campaign.metrics.impressions.toLocaleString()}</div>
          <div>Clicks: {campaign.metrics.clicks.toLocaleString()}</div>
          <div>CTR: {campaign.metrics.ctr.toFixed(2)}%</div>
          <div>Conversions: {campaign.metrics.conversions}</div>
        </div>
      ),
    },
    {
      key: 'roi',
      header: 'ROI',
      render: (_: any, campaign: MarketingCampaign) => (
        <div className={campaign.metrics.roi > 1 ? 'text-green-600 font-semibold text-lg' : 'text-red-600 text-lg'}>
          {campaign.metrics.roi.toFixed(2)}x
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Schedule',
      render: (_: any, campaign: MarketingCampaign) => (
        <div className="text-sm">
          <div>Start: {new Date(campaign.start_date).toLocaleDateString()}</div>
          <div>End: {new Date(campaign.end_date).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, campaign: MarketingCampaign) => (
        <div className="flex space-x-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate({ to: `/marketing/campaigns/${campaign.id}` })}
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {campaign.status === 'active' ? (
            <Button
              variant="warning"
              size="sm"
              onClick={() => pauseCampaignMutation.mutate(campaign.id)}
              title="Pause"
            >
              <PauseIcon className="h-4 w-4" />
            </Button>
          ) : campaign.status === 'paused' ? (
            <Button
              variant="success"
              size="sm"
              onClick={() => resumeCampaignMutation.mutate(campaign.id)}
              title="Resume"
            >
              <PlayIcon className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDuplicateCampaign(campaign)}
            title="Duplicate"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteCampaign(campaign.id)}
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Marketing Campaigns"
      subtitle="Create and manage marketing campaigns"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Marketing', path: '/marketing' },
        { label: 'Campaigns', path: '/marketing/campaigns' },
      ]}
      actions={
        <Button
          variant="primary"
          onClick={() => navigate({ to: '/marketing/campaigns/new' })}
          icon={PlusIcon}
        >
          New Campaign
        </Button>
      }
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={MagnifyingGlassIcon}
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              >
                <option value="">All Types</option>
                <option value="email">Email</option>
                <option value="social">Social</option>
                <option value="referral">Referral</option>
                <option value="promotional">Promotional</option>
                <option value="seasonal">Seasonal</option>
              </Select>
            </div>
            {selectedCampaigns.length > 0 && (
              <>
                <Button variant="warning" onClick={() => handleBulkAction('pause')}>
                  Pause Selected
                </Button>
                <Button variant="success" onClick={() => handleBulkAction('resume')}>
                  Resume Selected
                </Button>
                <Button variant="secondary" onClick={() => handleBulkAction('archive')}>
                  Archive Selected
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading level={3}>All Campaigns</Heading>
            <Text className="text-sm text-gray-500">{metadata?.total_items || 0} campaigns</Text>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            data={campaigns}
            columns={columns}
            loading={isLoading}
            emptyMessage="No campaigns found"
          />
          {metadata && metadata.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Text className="text-sm text-gray-500">
                Page {metadata.page} of {metadata.total_pages}
              </Text>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!metadata.has_previous}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!metadata.has_next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </PageTemplate>
  );
};

export default CampaignsListPage;
