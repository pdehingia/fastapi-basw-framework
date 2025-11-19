/**
 * Customer Sessions Management Page
 * Displays and manages all customer user sessions
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge, Input, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { sessionManagementService } from '@/services/api';
import { toast } from '@/services/toast';
import type { CustomerSession, SessionFilters } from '@/types/api.types';

const CustomerSessionsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SessionFilters>({
    is_active: undefined,
    device_type: undefined,
  });
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // Fetch data
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['customer-sessions', page, search, filters],
    queryFn: () =>
      sessionManagementService.getCustomerSessions({
        page,
        page_size: 20,
        search: search || undefined,
        ...filters,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['customer-sessions-stats'],
    queryFn: () => sessionManagementService.getCustomerSessionsStats(),
  });

  // Mutations
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      sessionManagementService.revokeCustomerSession(sessionId, {
        reason: 'Revoked by administrator',
        notify_user: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['customer-sessions-stats'] });
      toast.success('Session revoked successfully');
    },
    onError: () => toast.error('Failed to revoke session'),
  });

  const bulkRevokeMutation = useMutation({
    mutationFn: (sessionIds: string[]) =>
      sessionManagementService.bulkRevokeSessions(sessionIds, 'customer', {
        reason: 'Bulk revocation by administrator',
        notify_user: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-sessions'] });
      setSelectedSessions([]);
      toast.success('Sessions revoked successfully');
    },
    onError: () => toast.error('Failed to revoke sessions'),
  });

  const handleSessionSelect = (sessionId: string, isSelected: boolean) => {
    setSelectedSessions((prev) =>
      isSelected ? [...prev, sessionId] : prev.filter((id) => id !== sessionId)
    );
  };

  const handleRevokeSession = (sessionId: string) => {
    if (confirm('Revoke this session? The customer will be logged out immediately.')) {
      revokeSessionMutation.mutate(sessionId);
    }
  };

  const handleBulkRevoke = () => {
    if (selectedSessions.length === 0) return toast.error('Please select sessions to revoke');
    if (confirm(`Revoke ${selectedSessions.length} sessions?`)) {
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

  const stats = statsData?.data;
  const sessions = sessionsData?.data?.items || [];
  const metadata = sessionsData?.data?.metadata;

  const columns = [
    {
      key: 'select',
      header: '',
      render: (_: any, session: CustomerSession) => (
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
      key: 'customer',
      header: 'Customer',
      render: (_: any, session: CustomerSession) => (
        <div>
          <div className="font-medium">{session.customer_name}</div>
          <div className="text-sm text-gray-500">{session.customer_email}</div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      render: (_: any, session: CustomerSession) => {
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
      render: (_: any, session: CustomerSession) => (
        <div>
          <div className="text-sm">{session.location || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{session.ip_address}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, session: CustomerSession) => (
        <Badge variant={session.is_active ? 'success' : 'error'} size="sm">
          {session.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'activity',
      header: 'Last Activity',
      render: (_: any, session: CustomerSession) => (
        <div className="text-sm">{new Date(session.last_activity).toLocaleString()}</div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, session: CustomerSession) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleRevokeSession(session.id)}
          disabled={!session.is_active || revokeSessionMutation.isPending}
        >
          <XCircleIcon className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Customer Sessions"
      subtitle="Monitor and manage customer user sessions"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Sessions', path: '/sessions' },
        { label: 'Customer Sessions', path: '/sessions/customer' },
      ]}
    >
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { title: 'Total Sessions', value: stats?.total_sessions || 0 },
          { title: 'Active Sessions', value: stats?.active_sessions || 0 },
          { title: 'Sessions Today', value: stats?.sessions_today || 0 },
          { title: 'Unique Customers', value: stats?.unique_users || 0 },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardBody>
              <Text className="text-sm text-gray-500">{stat.title}</Text>
              <Heading level={3} className="mt-1">
                {stat.value.toLocaleString()}
              </Heading>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={MagnifyingGlassIcon}
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    is_active: e.target.value === '' ? undefined : e.target.value === 'active',
                  })
                }
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Device</label>
              <Select
                value={filters.device_type || ''}
                onChange={(e) => setFilters({ ...filters, device_type: e.target.value as any })}
              >
                <option value="">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </Select>
            </div>
            {selectedSessions.length > 0 && (
              <Button variant="danger" onClick={handleBulkRevoke}>
                Revoke Selected ({selectedSessions.length})
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading level={3}>Customer Sessions</Heading>
            <Text className="text-sm text-gray-500">{metadata?.total_items || 0} total</Text>
          </div>
        </CardHeader>
        <CardBody>
          <Table data={sessions} columns={columns} loading={isLoading} emptyMessage="No sessions found" />
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

export default CustomerSessionsPage;
