/**
 * Admin Activity Logs Component
 * Displays activity logs for a specific admin user
 */

import { useState } from 'react';
import { Button, Spinner } from '../../atoms';
import DataTable from '../DataTable/DataTable';
import { useAdminActivityLogs } from '../../../hooks/api/useAdminUsers';
import { 
  ClockIcon, 
  EyeIcon, 
  UserIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface AdminActivityLogsProps {
  adminUserId: string;
}

interface ActivityLogFilters {
  action_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const AdminActivityLogs = ({ adminUserId }: AdminActivityLogsProps) => {
  const [filters, setFilters] = useState<ActivityLogFilters>({
    page: 1,
    limit: 20
  });

  const { data: activityData, isLoading } = useAdminActivityLogs(adminUserId, filters);
  const activityLogs = activityData?.items || [];
  const totalCount = activityData?.metadata?.total_items || 0;

  const handleFilterChange = (newFilters: Partial<ActivityLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ ...prev, limit: size, page: 1 }));
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'login':
      case 'logout':
        return <UserIcon className="h-4 w-4" />;
      case 'create':
      case 'update':
      case 'delete':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'view':
        return <EyeIcon className="h-4 w-4" />;
      case 'error':
      case 'failed_login':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'view':
        return 'bg-purple-100 text-purple-800';
      case 'error':
      case 'failed_login':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      render: (log: any) => (
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {new Date(log.timestamp).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(log.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'action_type',
      header: 'Action',
      render: (log: any) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action_type)}`}>
          {getActionIcon(log.action_type)}
          <span className="ml-1">{log.action_type.toUpperCase()}</span>
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (log: any) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900">{log.description}</p>
          {log.details && (
            <p className="text-xs text-gray-500 mt-1">
              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (log: any) => (
        <span className="text-sm text-gray-600 font-mono">
          {log.ip_address || '-'}
        </span>
      )
    },
    {
      key: 'user_agent',
      header: 'User Agent',
      render: (log: any) => (
        <div className="max-w-xs">
          <p className="text-xs text-gray-500 truncate" title={log.user_agent}>
            {log.user_agent || '-'}
          </p>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={filters.action_type || ''}
              onChange={(e) => handleFilterChange({ action_type: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
              <option value="error">Error</option>
              <option value="failed_login">Failed Login</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange({ start_date: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange({ end_date: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {Object.keys(filters).some(key => filters[key as keyof ActivityLogFilters] && key !== 'page' && key !== 'limit') && (
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ page: 1, limit: 20 })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg border">
        {activityLogs.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Found</h3>
            <p className="text-gray-500">
              {Object.keys(filters).some(key => filters[key as keyof ActivityLogFilters] && key !== 'page' && key !== 'limit')
                ? 'No activity logs match the selected filters.'
                : 'This admin user has no recorded activity.'
              }
            </p>
          </div>
        ) : (
          <DataTable
            data={activityLogs}
            columns={columns}
            loading={isLoading}
            pagination={{
              currentPage: filters.page || 1,
              totalPages: Math.ceil(totalCount / (filters.limit || 20)),
              totalItems: totalCount,
              pageSize: filters.limit || 20,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
          />
        )}
      </div>

      {/* Summary Stats */}
      {activityLogs.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Activity Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Events:</span>
              <span className="font-medium text-gray-900 ml-2">{totalCount}</span>
            </div>
            <div>
              <span className="text-gray-500">This Page:</span>
              <span className="font-medium text-gray-900 ml-2">{activityLogs.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Latest:</span>
              <span className="font-medium text-gray-900 ml-2">
                {activityLogs[0]?.timestamp ? new Date(activityLogs[0].timestamp).toLocaleDateString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Page:</span>
              <span className="font-medium text-gray-900 ml-2">
                {filters.page || 1} of {Math.ceil(totalCount / (filters.limit || 20))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};