import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Key,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Input } from '../../../atoms/Input';
import { Select } from '../../../atoms/Select';
import { Button } from '../../../atoms/Button';
import { Badge } from '../../../atoms/Badge';
import { Spinner } from '../../../atoms/Spinner';
import { EnhancedDataTable } from '../../../organisms';
import { rolesPermissionsService } from '../../../../services/api';
import type { Role, RoleFilters, RoleListResponse } from '../../../../types/api.types';

/**
 * Roles List Page - Manage all roles
 */
export function RolesListPage() {
  const queryClient = useQueryClient();

  // State
  const [filters, setFilters] = useState<RoleFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Query for roles
  const { data, isLoading } = useQuery<RoleListResponse>({
    queryKey: ['roles', 'list', filters, page],
    queryFn: () =>
      rolesPermissionsService.getRoles(filters, {
        page,
        page_size: 20,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId: number) => rolesPermissionsService.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // Handle search
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery || undefined }));
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof RoleFilters, value: any) => {
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

  // Define table columns
  const columns = [
    {
      key: 'role_name' as keyof Role,
      label: 'Role',
      sortable: true,
      render: (role: Role) => (
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              role.is_system_role
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}
          >
            <Shield
              className={`h-4 w-4 ${
                role.is_system_role
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 dark:text-white">{role.role_name}</p>
              {role.is_system_role && (
                <Badge variant="default" className="text-xs">
                  System
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{role.role_slug}</p>
            {role.description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 max-w-md">
                {role.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'level' as keyof Role,
      label: 'Level',
      sortable: true,
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-gray-500" />
          <Badge variant="default">Level {role.level}</Badge>
        </div>
      ),
    },
    {
      key: 'parent_role_id' as keyof Role,
      label: 'Parent',
      sortable: false,
      render: (role: Role) =>
        role.parent_role_id ? (
          <Badge variant="info" className="text-xs">
            ID: {role.parent_role_id}
          </Badge>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">Root</span>
        ),
    },
    {
      key: 'is_active' as keyof Role,
      label: 'Status',
      sortable: true,
      render: (role: Role) => (
        <Badge variant={role.is_active ? 'success' : 'default'}>
          {role.is_active ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      ),
    },
    {
      key: 'created_at' as keyof Role,
      label: 'Created',
      sortable: true,
      render: (role: Role) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(role.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions' as keyof Role,
      label: 'Actions',
      sortable: false,
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" title="View Permissions">
            <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </Button>
          {!role.is_system_role && (
            <>
              <Button size="sm" variant="ghost" title="Edit">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete role "${role.role_name}"?`)) {
                    deleteMutation.mutate(role.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Summary stats
  const totalRoles = data?.total || 0;
  const activeCount = data?.roles.filter((r) => r.is_active).length || 0;
  const systemCount = data?.roles.filter((r) => r.is_system_role).length || 0;
  const customCount = data?.roles.filter((r) => !r.is_system_role).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roles</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage user roles and access levels
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRoles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{systemCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Custom</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{customCount}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Roles
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={
                filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_active',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
            >
              <option value="">All Roles</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </Select>
          </div>

          {/* System Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <Select
              value={
                filters.is_system_role === undefined
                  ? ''
                  : filters.is_system_role
                    ? 'true'
                    : 'false'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_system_role',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
            >
              <option value="">All Types</option>
              <option value="true">System Roles</option>
              <option value="false">Custom Roles</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Roles Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : !data || data.roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No roles found matching your filters
            </p>
          </div>
        ) : (
          <EnhancedDataTable
            data={data.roles}
            columns={columns}
            pagination={{
              currentPage: page,
              totalPages: data.total_pages,
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
