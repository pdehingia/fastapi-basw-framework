import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Eye,
  User,
  Clock,
  MapPin,
  Monitor,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { auditLogsService } from '@/services/api';
import type { UserActivityLog, UserActivityLogFilters } from '@/types/api.types';
import type { TableColumn } from '@/types';

export function ActivityLogsPage() {
  const [filters, setFilters] = useState<UserActivityLogFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch activity logs
  const {
    data: logsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs', 'activity', filters, page],
    queryFn: async () => {
      const response = await auditLogsService.getUserActivityLogs(filters, { page, size: 50 });
      return response.data;
    },
  });

  const handleFilterChange = (key: keyof UserActivityLogFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserTypeBadge = (userType: string) => {
    const variants: Record<string, 'error' | 'success' | 'info'> = {
      admin: 'error',
      provider: 'success',
      customer: 'info',
    };
    return <Badge variant={variants[userType] || 'default'}>{userType}</Badge>;
  };

  const getActivityCategoryBadge = (category?: string) => {
    if (!category) return null;
    const colors: Record<string, string> = {
      authentication: 'blue',
      booking: 'green',
      payment: 'purple',
      profile: 'orange',
      system: 'red',
    };
    const color = colors[category.toLowerCase()] || 'gray';
    return (
      <Badge
        variant="default"
        className={`bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-200`}
      >
        {category}
      </Badge>
    );
  };

  const columns: TableColumn<UserActivityLog>[] = [
    {
      key: 'id',
      title: 'ID',
      render: (log) => <span className="font-mono text-sm text-gray-600 dark:text-gray-400">#{log.id}</span>,
    },
    {
      key: 'user_type',
      title: 'User Type',
      render: (log) => getUserTypeBadge(log.user_type),
    },
    {
      key: 'user_id',
      title: 'User',
      render: (log) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm">{log.user_id.slice(0, 8)}...</span>
        </div>
      ),
    },
    {
      key: 'activity_type',
      title: 'Activity',
      render: (log) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{log.activity_type}</div>
          {log.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {log.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'activity_category',
      title: 'Category',
      render: (log) => getActivityCategoryBadge(log.activity_category),
    },
    {
      key: 'ip_address',
      title: 'IP Address',
      render: (log) => (
        <div className="flex items-center gap-2">
          {log.ip_address ? (
            <>
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-mono text-sm">{log.ip_address}</span>
            </>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: 'Timestamp',
      render: (log) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(log.created_at)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (log) => (
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed user activity tracking and monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {logsData?.metadata?.total_items?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {logsData?.items?.filter((l) => l.user_type === 'customer').length || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Providers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {logsData?.items?.filter((l) => l.user_type === 'provider').length || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
              <User className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {logsData?.items?.filter((l) => l.user_type === 'admin').length || '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              value={filters.user_type || 'all'}
              onChange={(e) => handleFilterChange('user_type', e.target.value === 'all' ? undefined : e.target.value)}
            >
              <option value="all">All User Types</option>
              <option value="admin">Admin</option>
              <option value="provider">Provider</option>
              <option value="customer">Customer</option>
            </Select>
            <Input
              type="date"
              placeholder="From Date"
              onChange={(e) => handleFilterChange('created_from', e.target.value || undefined)}
            />
            <Input
              type="date"
              placeholder="To Date"
              onChange={(e) => handleFilterChange('created_to', e.target.value || undefined)}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <EnhancedDataTable
            data={logsData?.items || []}
            columns={columns}
            pagination={{
              currentPage: logsData?.metadata?.page || 1,
              totalPages: logsData?.metadata?.total_pages || 1,
              pageSize: logsData?.metadata?.page_size || 50,
              totalItems: logsData?.metadata?.total_items || 0,
              onPageChange: setPage,
            }}
            isLoading={isLoading}
            emptyMessage="No activity logs found"
          />
        )}
      </Card>
    </div>
  );
}
