import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  Key,
  Users,
  CheckCircle,
  Layers,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Spinner } from '../../../atoms/Spinner';
import { Badge } from '../../../atoms/Badge';
import { rolesPermissionsService } from '../../../../services/api';
import type { RoleStatistics, PermissionStatistics } from '../../../../types/api.types';

/**
 * Roles & Permissions Dashboard - Overview of role and permission management
 */
export function RolesPermissionsDashboard() {
  // Fetch statistics
  const { data: roleStats, isLoading: roleStatsLoading } = useQuery<RoleStatistics>({
    queryKey: ['roles', 'statistics'],
    queryFn: () => rolesPermissionsService.getRoleStatistics(),
  });

  const { data: permStats, isLoading: permStatsLoading } = useQuery<PermissionStatistics>({
    queryKey: ['permissions', 'statistics'],
    queryFn: () => rolesPermissionsService.getPermissionStatistics(),
  });

  const isLoading = roleStatsLoading || permStatsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!roleStats || !permStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No statistics available</p>
        </div>
      </div>
    );
  }

  // Get role level data
  const roleLevels = Object.entries(roleStats.roles_by_level || {})
    .sort(([a], [b]) => parseInt(a) - parseInt(b));

  // Get permission categories
  const permCategories = Object.entries(permStats.permissions_by_category || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Roles & Permissions
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage user roles, permissions, and access control
        </p>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {roleStats.total_roles}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Roles</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {roleStats.active_roles}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {roleStats.total_roles > 0
                  ? ((roleStats.active_roles / roleStats.total_roles) * 100).toFixed(1)
                  : '0.0'}
                % of total
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Roles</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {roleStats.system_roles}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Protected roles</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Layers className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Custom Roles</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {roleStats.custom_roles}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">User-defined</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Permission Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Permissions
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {permStats.total_permissions}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Key className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Permissions
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {permStats.active_permissions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {permStats.total_permissions > 0
                  ? ((permStats.active_permissions / permStats.total_permissions) * 100).toFixed(1)
                  : '0.0'}
                % of total
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {Object.keys(permStats.permissions_by_category || {}).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Permission groups
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Role Hierarchy & Permission Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles by Level */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Roles by Hierarchy Level
          </h2>
          <div className="space-y-3">
            {roleLevels.length > 0 ? (
              roleLevels.map(([level, count]) => {
                const percentage =
                  roleStats.total_roles > 0
                    ? ((count / roleStats.total_roles) * 100).toFixed(1)
                    : '0.0';

                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="default" className="w-16 justify-center">
                        Level {level}
                      </Badge>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">No role data available</p>
            )}
          </div>
        </Card>

        {/* Permission Categories */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Top Permission Categories
          </h2>
          <div className="space-y-3">
            {permCategories.length > 0 ? (
              permCategories.map(([category, count]) => {
                const percentage =
                  permStats.total_permissions > 0
                    ? ((count / permStats.total_permissions) * 100).toFixed(1)
                    : '0.0';

                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {category}
                        </p>
                        <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                No permission data available
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Manage Roles</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {roleStats.total_roles} roles configured
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
            <Key className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">View Permissions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {permStats.total_permissions} permissions available
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
            <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Role Hierarchy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View role structure
            </p>
          </button>
        </div>
      </Card>
    </div>
  );
}
