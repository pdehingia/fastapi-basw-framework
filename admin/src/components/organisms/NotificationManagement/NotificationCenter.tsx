/**
 * NotificationCenter Component
 * Main dashboard for notification management with overview, recent notifications, and quick actions
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Heading, 
  Text, 
  Button, 
  Badge,
  IconButton 
} from '@/components/atoms';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  DataTable, 
  Modal 
} from '@/components/molecules';
import {
  useNotifications,
  useNotificationRealTimeStats,
  useSendNotification,
  useCancelNotification,
  useRetryNotification,
  useDeleteNotification
} from '@/hooks/api/useNotifications';
import type { Notification } from '@/types/api.types';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const navigate = useNavigate();
  
  // State management
  const [filters, setFilters] = useState({
    type: undefined as 'email' | 'push' | 'sms' | 'in_app' | undefined,
    status: undefined as 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked' | undefined,
    category: undefined as 'booking' | 'payment' | 'system' | 'marketing' | 'security' | undefined,
    priority: undefined as 'low' | 'medium' | 'high' | 'urgent' | undefined,
  });
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // API hooks
  const { data: notificationsData, isLoading, refetch } = useNotifications({
    page: 1,
    limit: 10,
    ...filters,
  });
  
  const { data: realTimeStats, isLoading: isStatsLoading } = useNotificationRealTimeStats();
  
  // Mutations
  const sendMutation = useSendNotification();
  const cancelMutation = useCancelNotification();
  const retryMutation = useRetryNotification();
  const deleteMutation = useDeleteNotification();

  // Process data
  const notifications = notificationsData?.items || [];
  const totalCount = notificationsData?.metadata?.total_items || 0;

  // Event handlers
  const handleSendNotification = (notificationId: string) => {
    sendMutation.mutate(notificationId);
  };

  const handleCancelNotification = (notificationId: string) => {
    cancelMutation.mutate(notificationId);
  };

  const handleRetryNotification = (notificationId: string) => {
    retryMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteMutation.mutate(notificationId);
  };

  const handleBulkAction = (action: 'send' | 'cancel' | 'retry' | 'delete') => {
    // Implementation for bulk actions would go here
    console.log(`Bulk ${action} for notifications:`, selectedNotifications);
    setShowBulkActions(false);
    setSelectedNotifications([]);
  };

  // Helper functions
  const getStatusBadgeProps = (status: Notification['status']) => {
    switch (status) {
      case 'pending':
        return { variant: 'warning' as const, children: 'Pending' };
      case 'sent':
        return { variant: 'info' as const, children: 'Sent' };
      case 'delivered':
        return { variant: 'success' as const, children: 'Delivered' };
      case 'failed':
        return { variant: 'error' as const, children: 'Failed' };
      case 'clicked':
        return { variant: 'success' as const, children: 'Clicked' };
      default:
        return { variant: 'default' as const, children: status };
    }
  };

  const getPriorityBadgeProps = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return { variant: 'error' as const, children: '🚨 Urgent' };
      case 'high':
        return { variant: 'warning' as const, children: '⬆️ High' };
      case 'medium':
        return { variant: 'info' as const, children: '➡️ Medium' };
      case 'low':
        return { variant: 'default' as const, children: '⬇️ Low' };
      default:
        return { variant: 'default' as const, children: priority };
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'email':
        return '✉️';
      case 'push':
        return '🔔';
      case 'sms':
        return '💬';
      case 'in_app':
        return '📱';
      default:
        return '📧';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Table columns configuration
  const columns = [
    {
      key: 'select',
      header: '',
      render: (notification: Notification) => (
        <input
          type="checkbox"
          checked={selectedNotifications.includes(notification.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedNotifications(prev => [...prev, notification.id]);
            } else {
              setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
            }
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
    },
    {
      key: 'type_and_title',
      header: 'Notification',
      sortable: true,
      render: (notification: Notification) => (
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getTypeIcon(notification.type)}</span>
          <div className="min-w-0 flex-1">
            <Text variant="body" className="font-medium text-gray-900">
              {truncateText(notification.title, 40)}
            </Text>
            <Text variant="caption" color="muted">
              {truncateText(notification.message, 60)}
            </Text>
            <div className="flex items-center space-x-2 mt-1">
              <Badge size="sm" variant="default">{notification.category}</Badge>
              <Badge size="sm" {...getPriorityBadgeProps(notification.priority)} />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: (notification: Notification) => (
        <div>
          {notification.recipient_email && (
            <Text variant="caption" className="text-gray-900">
              {notification.recipient_email}
            </Text>
          )}
          {notification.recipient_phone && (
            <Text variant="caption" color="muted">
              {notification.recipient_phone}
            </Text>
          )}
          {notification.recipient_id && (
            <Text variant="caption" color="muted">
              ID: {notification.recipient_id.substring(0, 8)}...
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (notification: Notification) => (
        <div>
          <Badge {...getStatusBadgeProps(notification.status)} />
          {notification.scheduled_for && new Date(notification.scheduled_for) > new Date() && (
            <Text variant="caption" color="muted" className="block mt-1">
              Scheduled: {formatDate(notification.scheduled_for)}
            </Text>
          )}
          {notification.sent_at && (
            <Text variant="caption" color="muted" className="block mt-1">
              Sent: {formatDate(notification.sent_at)}
            </Text>
          )}
          {notification.error_message && (
            <Text variant="caption" className="text-red-600 block mt-1">
              Error: {truncateText(notification.error_message, 30)}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (notification: Notification) => (
        <div className="flex items-center space-x-1">
          {notification.status === 'pending' && (
            <IconButton
              icon="🚀"
              size="sm"
              variant="ghost"
              onClick={() => handleSendNotification(notification.id)}
              title="Send Now"
            />
          )}
          {(notification.status === 'pending' || notification.status === 'sent') && (
            <IconButton
              icon="❌"
              size="sm"
              variant="ghost"
              onClick={() => handleCancelNotification(notification.id)}
              title="Cancel"
            />
          )}
          {notification.status === 'failed' && (
            <IconButton
              icon="🔄"
              size="sm"
              variant="ghost"
              onClick={() => handleRetryNotification(notification.id)}
              title="Retry"
            />
          )}
          <IconButton
            icon="🗑️"
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteNotification(notification.id)}
            title="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Heading as="h1" size="2xl" className="text-gray-900">
            Notification Center
          </Heading>
          <Text color="muted" className="mt-1">
            Manage and monitor all platform notifications, campaigns, and templates.
          </Text>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            disabled
            title="Feature coming soon"
          >
            Manage Templates
          </Button>
          <Button
            variant="outline"
            disabled
            title="Feature coming soon"
          >
            View Campaigns
          </Button>
          <Button
            variant="primary"
            disabled
            title="Feature coming soon"
          >
            Create Notification
          </Button>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      {!isStatsLoading && realTimeStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">⏳</span>
                  </div>
                </div>
                <div className="ml-3">
                  <Text variant="caption" color="muted">Pending</Text>
                  <Text variant="body" className="font-semibold text-gray-900">
                    {realTimeStats.total_pending.toLocaleString()}
                  </Text>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🚀</span>
                  </div>
                </div>
                <div className="ml-3">
                  <Text variant="caption" color="muted">Sending</Text>
                  <Text variant="body" className="font-semibold text-gray-900">
                    {realTimeStats.total_sending.toLocaleString()}
                  </Text>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-3">
                  <Text variant="caption" color="muted">Sent Today</Text>
                  <Text variant="body" className="font-semibold text-gray-900">
                    {realTimeStats.total_sent_today.toLocaleString()}
                  </Text>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-lg">❌</span>
                  </div>
                </div>
                <div className="ml-3">
                  <Text variant="caption" color="muted">Failed Today</Text>
                  <Text variant="body" className="font-semibold text-gray-900">
                    {realTimeStats.total_failed_today.toLocaleString()}
                  </Text>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Heading as="h3" size="lg">Recent Notifications</Heading>
            <div className="flex items-center space-x-3">
              {selectedNotifications.length > 0 && (
                <>
                  <Badge variant="info">{selectedNotifications.length} selected</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(true)}
                  >
                    Bulk Actions
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {/* Filter Controls */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  type: (e.target.value || undefined) as typeof filters.type 
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="email">Email</option>
                <option value="push">Push</option>
                <option value="sms">SMS</option>
                <option value="in_app">In-App</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: (e.target.value || undefined) as typeof filters.status 
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="clicked">Clicked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  category: (e.target.value || undefined) as typeof filters.category 
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
                <option value="marketing">Marketing</option>
                <option value="security">Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  priority: (e.target.value || undefined) as typeof filters.priority 
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={notifications}
            isLoading={isLoading}
            emptyMessage={
              Object.values(filters).some(Boolean)
                ? 'No notifications match the selected filters.'
                : 'No notifications found.'
            }
          />

          {/* Pagination Info */}
          {totalCount > 0 && (
            <div className="mt-4 text-sm text-gray-700">
              Showing {notifications.length} of {totalCount.toLocaleString()} notifications
            </div>
          )}
        </CardBody>
      </Card>

      {/* Bulk Actions Modal */}
      <Modal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        title="Bulk Actions"
      >
        <div className="space-y-4">
          <Text>
            Perform actions on {selectedNotifications.length} selected notification{selectedNotifications.length !== 1 ? 's' : ''}.
          </Text>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkAction('send')}
            >
              Send All
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkAction('cancel')}
            >
              Cancel All
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkAction('retry')}
            >
              Retry Failed
            </Button>
            <Button
              variant="error"
              onClick={() => handleBulkAction('delete')}
            >
              Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationCenter;