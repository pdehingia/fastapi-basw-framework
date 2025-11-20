/**
 * Admin Sessions Management Page
 * Displays and manages all admin user sessions with filtering and revocation capabilities
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge, Input, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { sessionManagementService } from '@/services/api';
import { toast } from '@/services/toast';
import type { AdminSession, SessionFilters } from '@/types/api.types';

const AdminSessionsPage = () => {
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SessionFilters>({
    is_active: undefined,
    device_type: undefined,
  });
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // Fetch sessions data
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-sessions', page, search, filters],
    queryFn: () =>
      sessionManagementService.getAdminSessions({
        page,
        page_size: 20,
        search: search || undefined,
        ...filters,
      }),
  });

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-sessions-stats'],
    queryFn: () => sessionManagementService.getAdminSessionsStats(),
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      sessionManagementService.revokeAdminSession(sessionId, {
        reason: 'Revoked by administrator',
        notify_user: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sessions-stats'] });
      toast.success('Session revoked successfully');
    },
    onError: (error) => {
      console.error('Revoke session error:', error);
      toast.error('Failed to revoke session');
    },
  });

  // Bulk revoke mutation
  const bulkRevokeMutation = useMutation({
    mutationFn: (sessionIds: string[]) =>
      sessionManagementService.bulkRevokeSessions(sessionIds, 'admin', {
        reason: 'Bulk revocation by administrator',
        notify_user: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sessions-stats'] });
      setSelectedSessions([]);
      toast.success('Sessions revoked successfully');
    },
    onError: (error) => {
      console.error('Bulk revoke error:', error);
      toast.error('Failed to revoke sessions');
    },
  });

  // Handlers
  const handleSessionSelect = (sessionId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSessions((prev) => [...prev, sessionId]);
    } else {
      setSelectedSessions((prev) => prev.filter((id) => id !== sessionId));
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) {
      revokeSessionMutation.mutate(sessionId);
    }
  };

  const handleBulkRevoke = () => {
    if (selectedSessions.length === 0) {
      toast.error('Please select sessions to revoke');
      return;
    }

    if (window.confirm(`Are you sure you want to revoke ${selectedSessions.length} sessions?`)) {
      bulkRevokeMutation.mutate(selectedSessions);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return DevicePhoneMobileIcon;
      case 'tablet':
        return DeviceTabletIcon;
      default:
        return ComputerDesktopIcon;
    }
  };

  // Statistics cards
  const stats = statsData?.data;
  const statCards = [
    {
      title: 'Total Sessions',
      value: stats?.total_sessions || 0,
      color: 'blue',
    },
    {
      title: 'Active Sessions',
      value: stats?.active_sessions || 0,
      color: 'green',
    },
    {
      title: 'Sessions Today',
      value: stats?.sessions_today || 0,
      color: 'purple',
    },
    {
      title: 'Unique Admins',
      value: stats?.unique_users || 0,
      color: 'orange',
    },
  ];

  // Table columns
  const columns = [
    {
      key: 'select',
      header: '',
      render: (_: any, session: AdminSession) => (
        <input
          type="checkbox"
          checked={selectedSessions.includes(session.id)}
          onChange={(e) => handleSessionSelect(session.id, e.target.checked)}
          className="rounded border-gray-300"
          disabled={!session.is_active}
        />
      ),
    },
    {
      key: 'admin',
      header: 'Admin User',
      render: (_: any, session: AdminSession) => (
        <div>
          <div className="font-medium">{session.admin_name}</div>
          <div className="text-sm text-gray-500">{session.admin_email}</div>
          {session.role && (
            <Badge variant="default" size="sm" className="mt-1">
              {session.role}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      render: (_: any, session: AdminSession) => {
        const DeviceIcon = getDeviceIcon(session.device_type);
        return (
          <div className="flex items-center space-x-2">
            <DeviceIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium">{session.device_name}</div>
              <div className="text-xs text-gray-500">
                {session.browser} • {session.os}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'location',
      header: 'Location',
      render: (_: any, session: AdminSession) => (
        <div>
          <div className="text-sm">{session.location || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{session.ip_address}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, session: AdminSession) => (
        <div className="space-y-1">
          <Badge variant={session.is_active ? 'success' : 'error'} size="sm">
            {session.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {session.is_current && (
            <Badge variant="info" size="sm">
              Current
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'activity',
      header: 'Last Activity',
      render: (_: any, session: AdminSession) => (
        <div>
          <div className="text-sm">
            {new Date(session.last_activity).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            Created: {new Date(session.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, session: AdminSession) => (
        <div className="flex space-x-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRevokeSession(session.id)}
            disabled={!session.is_active || session.is_current || revokeSessionMutation.isPending}
            title={session.is_current ? 'Cannot revoke current session' : 'Revoke session'}
          >
            <XCircleIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const sessions = sessionsData?.data?.items || [];
  const metadata = sessionsData?.data?.metadata;

  return (
    <PageTemplate
      title="Admin Sessions"
      subtitle="Monitor and manage admin user sessions"
      breadcrumbs={[
        { id: '1', label: 'Dashboard', href: '/dashboard' },
        { id: '2', label: 'Sessions', href: '/sessions' },
        { id: '3', label: 'Admin Sessions', href: '/sessions/admin', current: true },
      ]}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardBody>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {stat.title}
              </Text>
              <Heading size="lg" className="mt-1">
                {statsLoading ? '...' : stat.value.toLocaleString()}
              </Heading>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by name, email, or IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Select
                value={filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    is_active: value === '' ? undefined : value === 'active',
                  })
                }
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>

            {/* Device Type Filter */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device
              </label>
              <Select
                value={filters.device_type || ''}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    device_type: value as any,
                  })
                }
                options={[
                  { value: '', label: 'All Devices' },
                  { value: 'desktop', label: 'Desktop' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'tablet', label: 'Tablet' },
                ]}
              />
            </div>

            {/* Bulk Actions */}
            {selectedSessions.length > 0 && (
              <Button
                variant="danger"
                onClick={handleBulkRevoke}
                disabled={bulkRevokeMutation.isPending}
              >
                Revoke Selected ({selectedSessions.length})
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading size="lg">Admin Sessions</Heading>
            <Text className="text-sm text-gray-500">
              {metadata?.total_items || 0} total sessions
            </Text>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            data={sessions}
            columns={columns}
            loading={sessionsLoading}
            emptyMessage="No sessions found"
          />

          {/* Pagination */}
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

export default AdminSessionsPage;
