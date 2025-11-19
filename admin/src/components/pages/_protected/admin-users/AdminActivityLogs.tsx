/**
 * Admin Activity Logs Component
 * Displays activity logs for a specific admin user
 */

import { useState } from 'react';
import { DataTable } from '@/components/organisms';
import { Button } from '@/components/atoms';
import { useAdminActivityLogs } from '@/hooks/api/useAdminUsers';
import { 
  EyeIcon, 
  ClockIcon, 
  ComputerDesktopIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

interface AdminActivityLogsProps {
  adminUserId: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export const AdminActivityLogs: React.FC<AdminActivityLogsProps> = ({ adminUserId }) => {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  // API hook
  const { data: logsData, isLoading } = useAdminActivityLogs(adminUserId, { page });

  const logs = logsData?.items || [];
  const totalCount = logsData?.total || 0;

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create':
      case 'add':
        return 'bg-blue-100 text-blue-800';
      case 'update':
      case 'edit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (log: ActivityLog) => (
        <div className="flex items-center text-sm">
          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="font-medium text-gray-900">
              {new Date(log.created_at).toLocaleDateString()}
            </div>
            <div className="text-gray-500">
              {new Date(log.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: ActivityLog) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
          {log.action.toUpperCase()}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (log: ActivityLog) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900 truncate">{log.description}</p>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Additional details available
            </p>
          )}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (log: ActivityLog) => (
        <div className="flex items-center text-sm text-gray-600">
          <div>
            {log.ip_address && (
              <div className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span>{log.ip_address}</span>
              </div>
            )}
            {log.user_agent && (
              <div className="flex items-center mt-1">
                <ComputerDesktopIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs truncate max-w-32" title={log.user_agent}>
                  {log.user_agent.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (log: ActivityLog) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLog(log)}
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      )
    }
  ];

  if (logs.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity logs</h3>
        <p className="mt-1 text-sm text-gray-500">
          No activity has been recorded for this admin user yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={logs}
        columns={columns}
        loading={isLoading}
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(totalCount / 20),
          totalItems: totalCount,
          pageSize: 20,
          onPageChange: setPage,
        }}
      />

      {/* Activity Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                  {selectedLog.action.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>

              {selectedLog.ip_address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.ip_address}</p>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-900 break-all">{selectedLog.user_agent}</p>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Details</label>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};