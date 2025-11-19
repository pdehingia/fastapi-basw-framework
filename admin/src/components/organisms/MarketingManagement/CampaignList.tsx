/**
 * Marketing Campaign List
 * Enhanced campaign management with advanced filtering, analytics, and bulk operations
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Edit3,
  Copy,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react';
import Button from '../../atoms/Button/Button';
import { EnhancedDataTable } from '../../organisms';
import { 
  Campaign, 
  CampaignStatus, 
  CampaignType, 
  CampaignManager,
  MarketingUtils 
} from '../../../utils/marketing';
import { BulkOperation } from '../../../utils/datatable';

// Define Column type compatible with EnhancedDataTable
interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  filterType?: string;
  options?: Array<{value: string; label: string}>;
  render?: (value: any, row: Campaign) => React.ReactNode;
}

export interface CampaignListProps {
  campaigns: Campaign[];
  isLoading?: boolean;
  onCreateCampaign: () => void;
  onEditCampaign: (campaign: Campaign) => void;
  onViewCampaign: (campaign: Campaign) => void;
  onDuplicateCampaign: (campaign: Campaign) => void;
  onDeleteCampaign: (campaign: Campaign) => void;
  onUpdateCampaignStatus: (campaignId: string, status: CampaignStatus) => void;
  onBulkOperation?: (operation: string, campaignIds: string[]) => Promise<void>;
}

interface CampaignFilters {
  status: CampaignStatus | 'all';
  type: CampaignType | 'all';
  dateRange: {
    start: string;
    end: string;
  } | null;
  budgetRange: {
    min: number;
    max: number;
  } | null;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  isLoading = false,
  onCreateCampaign,
  onEditCampaign,
  onViewCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
  onUpdateCampaignStatus,
}) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [filters, setFilters] = useState<CampaignFilters>({
    status: 'all',
    type: 'all',
    dateRange: null,
    budgetRange: null,
  });

  // Handle bulk operation
  const handleBulkOperation = useCallback(async (operation: BulkOperation, campaignIds: string[]) => {
    const selectedCampaignData = campaigns.filter(c => campaignIds.includes(c.id));
    await operation.action(selectedCampaignData);
  }, [campaigns]);

  // Filter campaigns based on current filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      // Status filter
      if (filters.status !== 'all' && campaign.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && campaign.type !== filters.type) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const campaignStart = new Date(campaign.startDate);
        const filterStart = new Date(filters.dateRange.start);
        const filterEnd = new Date(filters.dateRange.end);
        
        if (campaignStart < filterStart || campaignStart > filterEnd) {
          return false;
        }
      }

      // Budget range filter
      if (filters.budgetRange) {
        if (campaign.budget < filters.budgetRange.min || campaign.budget > filters.budgetRange.max) {
          return false;
        }
      }

      return true;
    });
  }, [campaigns, filters]);

  // Define table columns
  const columns: Column[] = [
    {
      key: 'name',
      header: 'Campaign',
      width: 250,
      sortable: true,
      filterType: 'text',
      render: (value: string, row: Campaign) => {
        const { status, progress } = CampaignManager.getCampaignStatus(row);
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.description}</div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                status === 'active' ? 'bg-green-100 text-green-800' :
                status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                status === 'completed' ? 'bg-purple-100 text-purple-800' :
                status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
              {progress > 0 && progress < 100 && (
                <div className="flex items-center gap-1">
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      width: 150,
      sortable: true,
      filterType: 'select',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'social', label: 'Social Media' },
        { value: 'display', label: 'Display' },
        { value: 'search', label: 'Search' },
        { value: 'influencer', label: 'Influencer' },
        { value: 'content', label: 'Content' },
        { value: 'event', label: 'Event' },
        { value: 'referral', label: 'Referral' },
      ],
      render: (value: CampaignType) => (
        <span className="text-gray-900">
          {MarketingUtils.getCampaignTypeLabel(value)}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      width: 120,
      sortable: true,
      filterType: 'number',
      render: (value: number, row: Campaign) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {MarketingUtils.formatCurrency(value, row.currency)}
          </div>
          <div className="text-sm text-gray-500">
            Spent: {MarketingUtils.formatCurrency(row.spent, row.currency)}
          </div>
        </div>
      ),
    },
    {
      key: 'performance',
      header: 'Performance',
      width: 180,
      sortable: false,
      render: (_, row: Campaign) => {
        const metrics = CampaignManager.calculateCampaignMetrics(row);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                ROAS: {metrics.roas.toFixed(2)}x
              </span>
            </div>
            <div className="text-sm text-gray-500">
              CTR: {MarketingUtils.formatPercentage(metrics.ctr)}
            </div>
            <div className="text-sm text-gray-500">
              Conversions: {MarketingUtils.formatNumber(metrics.conversions)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'dateRange',
      header: 'Timeline',
      width: 160,
      sortable: true,
      filterType: 'date',
      render: (_, row: Campaign) => {
        const start = new Date(row.startDate);
        const end = new Date(row.endDate);
        const { daysRemaining } = CampaignManager.getCampaignStatus(row);
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-900">
              <Calendar className="w-3 h-3" />
              {start.toLocaleDateString()} - {end.toLocaleDateString()}
            </div>
            {daysRemaining > 0 && (
              <div className="text-sm text-gray-500">
                {daysRemaining} days remaining
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'targetAudience',
      header: 'Audience',
      width: 140,
      sortable: false,
      render: (_, row: Campaign) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-900">
            <Target className="w-3 h-3" />
            {row.targetAudience.name}
          </div>
          <div className="text-sm text-gray-500">
            Size: {MarketingUtils.formatNumber(row.targetAudience.estimatedSize)}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 120,
      sortable: false,
      render: (_, row: Campaign) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewCampaign(row);
            }}
            ariaLabel="View campaign"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditCampaign(row);
            }}
            ariaLabel="Edit campaign"
          >
            <Edit3 className="w-4 h-4" />
          </Button>

          {row.status === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateCampaignStatus(row.id, 'paused');
              }}
              ariaLabel="Pause campaign"
              className="text-yellow-600 hover:text-yellow-800"
            >
              <Pause className="w-4 h-4" />
            </Button>
          ) : row.status === 'paused' || row.status === 'scheduled' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateCampaignStatus(row.id, 'active');
              }}
              ariaLabel="Start campaign"
              className="text-green-600 hover:text-green-800"
            >
              <Play className="w-4 h-4" />
            </Button>
          ) : null}

          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              ariaLabel="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg py-1 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateCampaign(row);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCampaign(row);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Define bulk operations
  const bulkOperations: BulkOperation[] = [
    {
      id: 'activate',
      label: 'Activate',
      action: async (campaigns: Campaign[]) => {
        for (const campaign of campaigns) {
          await onUpdateCampaignStatus(campaign.id, 'active');
        }
      },
    },
    {
      id: 'pause',
      label: 'Pause',
      action: async (campaigns: Campaign[]) => {
        for (const campaign of campaigns) {
          await onUpdateCampaignStatus(campaign.id, 'paused');
        }
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      action: async (campaigns: Campaign[]) => {
        for (const campaign of campaigns) {
          onDuplicateCampaign(campaign);
        }
      },
    },
    {
      id: 'export',
      label: 'Export',
      action: async (campaigns: Campaign[]) => {
        // Export selected campaigns to CSV
        const csvData = campaigns.map(c => ({
          name: c.name,
          type: c.type,
          status: c.status,
          budget: c.budget,
          cost: c.metrics?.cost || 0,
          revenue: c.metrics?.revenue || 0,
          startDate: c.startDate,
          endDate: c.endDate
        }));
        console.log('Exporting campaigns:', csvData);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      variant: 'danger' as const,
      confirmMessage: 'Are you sure you want to delete the selected campaigns? This action cannot be undone.',
      action: async (campaigns: Campaign[]) => {
        for (const campaign of campaigns) {
          onDeleteCampaign(campaign);
        }
      },
    },
  ];

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.cost || 0), 0);
    const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active').length;
    
    const totalMetrics = filteredCampaigns.reduce((acc, campaign) => {
      const metrics = CampaignManager.calculateCampaignMetrics(campaign);
      return {
        revenue: acc.revenue + metrics.revenue,
        conversions: acc.conversions + metrics.conversions,
      };
    }, { revenue: 0, conversions: 0 });
    
    const avgROAS = totalSpent > 0 ? totalMetrics.revenue / totalSpent : 0;
    
    return {
      totalCampaigns: filteredCampaigns.length,
      activeCampaigns,
      totalBudget,
      totalSpent,
      totalRevenue: totalMetrics.revenue,
      totalConversions: totalMetrics.conversions,
      avgROAS,
    };
  }, [filteredCampaigns]);

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h1>
              <p className="mt-1 text-gray-600">
                Manage and track your marketing campaigns across all channels
              </p>
            </div>
            <Button
              variant="primary"
              onClick={onCreateCampaign}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCampaigns}
            </div>
            <div className="text-sm text-gray-600">Total Campaigns</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeCampaigns}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {MarketingUtils.formatCurrency(stats.totalBudget)}
            </div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {MarketingUtils.formatCurrency(stats.totalSpent)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {MarketingUtils.formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.avgROAS.toFixed(2)}x
            </div>
            <div className="text-sm text-gray-600">Avg ROAS</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as CampaignStatus | 'all' })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as CampaignType | 'all' })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="social">Social Media</option>
            <option value="display">Display</option>
            <option value="search">Search</option>
            <option value="influencer">Influencer</option>
            <option value="content">Content</option>
            <option value="event">Event</option>
            <option value="referral">Referral</option>
          </select>
          
          {(filters.status !== 'all' || filters.type !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({
                status: 'all',
                type: 'all',
                dateRange: null,
                budgetRange: null,
              })}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <EnhancedDataTable
          data={filteredCampaigns}
          columns={columns}
          height={600}
          enableVirtualization={true}
          enableSelection={true}
          enableSorting={true}
          enableFiltering={true}
          enableColumnCustomization={true}
          enableBulkOperations={true}
          enableExport={true}
          bulkOperations={bulkOperations}
          onBulkOperation={handleBulkOperation}
          onRowClick={(campaign) => onViewCampaign(campaign)}
          onSelectionChange={setSelectedCampaigns}
          tableId="campaigns-table"
          isLoading={isLoading}
          loadingMessage="Loading campaigns..."
        />
      </div>
    </div>
  );
};