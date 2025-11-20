import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Flag,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Percent,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Spinner } from '../../../atoms/Spinner';
import { EnhancedDataTable } from '../../../organisms';
import { featureFlagsService } from '../../../../services/api';
import type {
  FeatureFlag,
  FeatureFlagFilters,
  FeatureFlagListResponse,
} from '../../../../types/api.types';

/**
 * Feature Flags List Page - Manage all feature flags
 */
export function FeatureFlagsListPage() {
  const queryClient = useQueryClient();

  // State
  const [filters, setFilters] = useState<FeatureFlagFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Query for feature flags
  const { data, isLoading } = useQuery<FeatureFlagListResponse>({
    queryKey: ['featureFlags', 'list', filters, page],
    queryFn: () =>
      featureFlagsService.getFeatureFlags(filters, {
        page,
        page_size: 20,
      }),
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: ({ flagId, isEnabled }: { flagId: string; isEnabled: boolean }) =>
      featureFlagsService.toggleFeatureFlag(flagId, { is_enabled: isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (flagId: string) => featureFlagsService.deleteFeatureFlag(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });

  // Handle search
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery || undefined }));
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof FeatureFlagFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  // Handle toggle
  const handleToggle = (flagId: string, currentState: boolean) => {
    toggleMutation.mutate({ flagId, isEnabled: !currentState });
  };

  // Define table columns
  const columns = [
    {
      key: 'name' as keyof FeatureFlag,
      label: 'Flag',
      sortable: true,
      render: (flag: FeatureFlag) => (
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              flag.is_enabled
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {flag.is_enabled ? (
              <ToggleRight className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{flag.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{flag.key}</p>
            {flag.description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 max-w-md">
                {flag.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'is_enabled' as keyof FeatureFlag,
      label: 'Status',
      sortable: true,
      render: (flag: FeatureFlag) => (
        <Badge variant={flag.is_enabled ? 'success' : 'default'}>
          {flag.is_enabled ? (
            <>
              <ToggleRight className="h-3 w-3 mr-1" />
              Enabled
            </>
          ) : (
            <>
              <ToggleLeft className="h-3 w-3 mr-1" />
              Disabled
            </>
          )}
        </Badge>
      ),
    },
    {
      key: 'rollout_percentage' as keyof FeatureFlag,
      label: 'Rollout',
      sortable: true,
      render: (flag: FeatureFlag) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Percent className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {flag.rollout_percentage}%
            </span>
          </div>
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                flag.is_enabled
                  ? 'bg-green-600 dark:bg-green-400'
                  : 'bg-gray-400 dark:bg-gray-600'
              }`}
              style={{ width: `${flag.rollout_percentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'user_segments' as keyof FeatureFlag,
      label: 'Targeting',
      sortable: false,
      render: (flag: FeatureFlag) => (
        <div className="space-y-1">
          {flag.user_segments && flag.user_segments.length > 0 ? (
            <>
              <Badge variant="info" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {flag.user_segments.length} segment{flag.user_segments.length > 1 ? 's' : ''}
              </Badge>
              <div className="flex flex-wrap gap-1 mt-1">
                {flag.user_segments.slice(0, 2).map((segment) => (
                  <span
                    key={segment}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {segment}
                  </span>
                ))}
                {flag.user_segments.length > 2 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                    +{flag.user_segments.length - 2}
                  </span>
                )}
              </div>
            </>
          ) : (
            <Badge variant="default" className="text-xs">
              Global
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'conditions' as keyof FeatureFlag,
      label: 'Conditions',
      sortable: false,
      render: (flag: FeatureFlag) => {
        const hasConditions = flag.conditions && Object.keys(flag.conditions).length > 0;
        return hasConditions ? (
          <Badge variant="warning" className="text-xs">
            {Object.keys(flag.conditions!).length} condition{Object.keys(flag.conditions!).length > 1 ? 's' : ''}
          </Badge>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">None</span>
        );
      },
    },
    {
      key: 'created_at' as keyof FeatureFlag,
      label: 'Created',
      sortable: true,
      render: (flag: FeatureFlag) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(flag.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions' as keyof FeatureFlag,
      label: 'Actions',
      sortable: false,
      render: (flag: FeatureFlag) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggle(flag.id, flag.is_enabled)}
            disabled={toggleMutation.isPending}
            title={flag.is_enabled ? 'Disable Flag' : 'Enable Flag'}
          >
            {flag.is_enabled ? (
              <ToggleLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ToggleRight className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
          </Button>
          <Button size="sm" variant="ghost" title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm(`Are you sure you want to delete flag "${flag.name}"?`)) {
                deleteMutation.mutate(flag.id);
              }
            }}
            disabled={deleteMutation.isPending}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  // Summary stats
  const totalFlags = data?.total || 0;
  const enabledCount = data?.items.filter((f) => f.is_enabled).length || 0;
  const disabledCount = data?.items.filter((f) => !f.is_enabled).length || 0;
  const partialRollout = data?.items.filter((f) => f.rollout_percentage > 0 && f.rollout_percentage < 100).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage and control feature rollouts across the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Flag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Flags</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalFlags}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enabled</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{enabledCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <ToggleLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disabled</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{disabledCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Percent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Partial Rollout</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{partialRollout}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Flags
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by name, key, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={
                filters.is_enabled === undefined ? '' : filters.is_enabled ? 'true' : 'false'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_enabled',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
            >
              <option value="">All Flags</option>
              <option value="true">Enabled Only</option>
              <option value="false">Disabled Only</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Feature Flags Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No feature flags found matching your filters
            </p>
          </div>
        ) : (
          <EnhancedDataTable
            data={data.items}
            columns={columns}
            pagination={{
              currentPage: page,
              totalPages: data.pages,
              pageSize: 20,
              totalItems: data.total,
              onPageChange: setPage,
            }}
          />
        )}
      </Card>
    </div>
  );
}
