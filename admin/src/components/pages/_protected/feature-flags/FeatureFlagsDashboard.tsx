import { useQuery } from '@tanstack/react-query';
import { Flag, ToggleLeft, ToggleRight, Users, Percent, AlertCircle } from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Spinner } from '../../../atoms/Spinner';
import { Badge } from '../../../atoms/Badge';
import { featureFlagsService } from '../../../../services/api';
import type { FeatureFlagListResponse } from '../../../../types/api.types';

/**
 * Feature Flags Dashboard - Overview of feature flag management
 */
export function FeatureFlagsDashboard() {
  // Fetch all feature flags
  const { data, isLoading } = useQuery<FeatureFlagListResponse>({
    queryKey: ['featureFlags', 'list'],
    queryFn: () => featureFlagsService.getFeatureFlags({}, { page: 1, page_size: 100 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No feature flags available</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalFlags = data.total;
  const enabledFlags = data.items.filter((f) => f.is_enabled).length;
  const disabledFlags = data.items.filter((f) => !f.is_enabled).length;
  const flagsWithRollout = data.items.filter((f) => f.rollout_percentage > 0 && f.rollout_percentage < 100).length;
  const flagsWithSegments = data.items.filter((f) => f.user_segments && f.user_segments.length > 0).length;

  // Get average rollout percentage
  const avgRollout = totalFlags > 0
    ? (data.items.reduce((sum, f) => sum + f.rollout_percentage, 0) / totalFlags).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage feature flags and control feature rollouts
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Flags</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalFlags}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Flag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enabled</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {enabledFlags}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {totalFlags > 0 ? ((enabledFlags / totalFlags) * 100).toFixed(1) : '0.0'}% of total
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ToggleRight className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disabled</p>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {disabledFlags}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {totalFlags > 0 ? ((disabledFlags / totalFlags) * 100).toFixed(1) : '0.0'}% of total
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <ToggleLeft className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rollout</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {avgRollout}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {flagsWithRollout} partial rollouts
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Percent className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Flags by Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          Recent Feature Flags
        </h2>
        <div className="space-y-3">
          {data.items.slice(0, 8).map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`p-2 rounded-lg ${
                    flag.is_enabled
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {flag.is_enabled ? (
                    <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">{flag.name}</p>
                    <Badge variant={flag.is_enabled ? 'success' : 'default'} className="text-xs">
                      {flag.is_enabled ? 'ENABLED' : 'DISABLED'}
                    </Badge>
                    {flag.user_segments && flag.user_segments.length > 0 && (
                      <Badge variant="info" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {flag.user_segments.length} segment{flag.user_segments.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{flag.key}</p>
                  {flag.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {flag.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {flag.rollout_percentage}%
                  </span>
                </div>
                <div className="mt-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rollout Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Percent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Rollout Distribution
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Full Rollout (100%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.items.filter((f) => f.rollout_percentage === 100).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Partial Rollout</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {flagsWithRollout}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">No Rollout (0%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.items.filter((f) => f.rollout_percentage === 0).length}
              </span>
            </div>
          </div>
        </Card>

        {/* Targeting */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Targeting
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">With User Segments</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {flagsWithSegments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Global (No Targeting)</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalFlags - flagsWithSegments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">With Conditions</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.items.filter((f) => f.conditions && Object.keys(f.conditions).length > 0).length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
            <Flag className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">View All Flags</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage all feature flags
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
            <ToggleRight className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Create Flag</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add a new feature flag
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Manage Segments</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {flagsWithSegments} flags with targeting
            </p>
          </button>
        </div>
      </Card>
    </div>
  );
}
