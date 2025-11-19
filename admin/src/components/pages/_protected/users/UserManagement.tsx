import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { 
  UserGroupIcon, 
  PauseCircleIcon, 
  PlusCircleIcon, 
  UserIcon,
  CheckBadgeIcon,
  EyeIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge, Input, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table, Modal } from '@/components/molecules';
import { userService } from '@/services/api';
import { ROUTES } from '@/config/routes';
import { toast } from '@/services/toast';
import CreateUserModal from './CreateUserModal';

const UserManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State management
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    is_active: undefined as boolean | undefined,
    is_verified: undefined as boolean | undefined,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);

  // API Queries
  const { 
    data: dashboardStats, 
    isLoading: statsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: userService.getDashboardStats,
  });

  const { 
    data: usersData, 
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['users', page, search, filters],
    queryFn: () => userService.getUsers({
      page,
      search: search || undefined,
      is_active: filters.is_active,
      is_verified: filters.is_verified,
    }),
  });

  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: 'active' | 'inactive' | 'suspended'; reason?: string }) => 
      userService.updateUserStatus(userId, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      console.error('Update user status error:', error);
      toast.error('Failed to update user status');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (action: any) => userService.bulkUserActions(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
      setSelectedUsers([]);
      setShowBulkActionsModal(false);
      toast.success('Bulk action completed successfully');
    },
    onError: (error) => {
      console.error('Bulk action error:', error);
      toast.error('Failed to complete bulk action');
    },
  });

  const exportUsersMutation = useMutation({
    mutationFn: (exportRequest: any) => userService.exportUsers(exportRequest),
    onSuccess: (response) => {
      if (response.success && response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
        toast.success('Export started! Download will begin shortly.');
      }
    },
    onError: (error) => {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    },
  });

  // Helper functions
  const handleUserSelect = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

    const handleStatusChange = (userId: string, status: string, reason?: string) => {
    const validStatus = status as 'active' | 'inactive' | 'suspended';
    updateUserStatusMutation.mutate({ 
      userId, 
      status: validStatus, 
      reason: reason || undefined 
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to perform bulk action');
      return;
    }

    let reason;
    if (action === 'suspend') {
      reason = prompt('Please provide a reason for suspension:');
      if (!reason) return;
    }

    bulkActionMutation.mutate({
      user_ids: selectedUsers,
      action,
      reason,
      notify_users: true,
    });
  };

  const handleExportUsers = () => {
    exportUsersMutation.mutate({
      format: 'csv',
      filters: {
        ...filters,
        search,
      },
      include_fields: [
        'id', 'email', 'username', 'full_name', 'phone', 
        'is_active', 'is_verified', 'department', 'created_at'
      ],
    });
  };

  // Computed values
  const stats = (dashboardStats?.data as any) || {};
  const users = (usersData?.data as any)?.items || [];
  const metadata = (usersData?.data as any)?.metadata || {};

  // Dashboard stats cards
  const statsCards = [
    {
      title: 'Total Users',
      value: stats.total_users || 0,
      icon: UserGroupIcon,
      color: 'blue',
      change: '+2.1%',
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: stats.active_users || 0,
      icon: CheckBadgeIcon,
      color: 'green',
      change: '+5.4%',
      trend: 'up',
    },
    {
      title: 'Inactive Users',
      value: stats.inactive_users || 0,
      icon: PauseCircleIcon,
      color: 'yellow',
      change: '-1.2%',
      trend: 'down',
    },
    {
      title: 'New This Month',
      value: stats.new_this_month || 0,
      icon: PlusCircleIcon,
      color: 'purple',
      change: '+12.5%',
      trend: 'up',
    },
  ];

  // Table columns
  const columns = [
    {
      key: 'select',
      header: '',
      render: (_value: any, user: any) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => handleUserSelect(user.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      key: 'user',
      header: 'User',
      sortable: true,
      accessor: (user: any) => user.full_name || user.username,
      render: (_value: any, user: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{user.full_name || user.username}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      accessor: (user: any) => user.is_superuser ? 'Super Admin' : 'Admin',
      render: (_value: any, user: any) => (
        <Badge
          variant={user.is_superuser ? 'success' : 'default'}
          size="sm"
        >
          {user.is_superuser ? 'Super Admin' : 'Admin'}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      accessor: 'department',
      render: (_value: any, user: any) => user.department || '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: 'is_active',
      render: (_value: any, user: any) => (
        <div className="flex items-center space-x-2">
          <Badge
            variant={user.is_active ? 'success' : 'error'}
            size="sm"
          >
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {user.is_verified && (
            <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      accessor: 'created_at',
      render: (_value: any, user: any) => new Date(user.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: any, user: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/users/users/${user.id}` })}
            leftIcon={<EyeIcon className="w-4 h-4" />}
          >
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(user.id, user.is_active ? 'suspended' : 'active')}
            disabled={updateUserStatusMutation.isPending}
            leftIcon={user.is_active ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          >
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(user.id)}
            disabled={deleteUserMutation.isPending}
            className="text-red-600 hover:text-red-700"
            leftIcon={<TrashIcon className="w-4 h-4" />}
          >
          </Button>
        </div>
      ),
    },
  ];

  if (statsError || usersError) {
    return (
      <PageTemplate
        title="User Management"
        subtitle="Manage and monitor all platform users"
      >
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <Text className="text-lg font-semibold mb-2">Error loading user data</Text>
          <Text className="text-gray-600 mb-4">
            {statsError?.message || usersError?.message || 'Unknown error occurred'}
          </Text>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="User Management"
      subtitle="Manage and monitor all platform users"
      breadcrumbs={[
        { id: 'dashboard', label: 'Dashboard', href: ROUTES.DASHBOARD },
        { id: 'users', label: 'User Management', current: true }
      ]}
      primaryAction={{
        id: 'add-user',
        label: 'Add New User',
        icon: 'UserPlusIcon',
        onClick: () => setShowCreateModal(true),
      }}
      secondaryActions={[
        {
          id: 'bulk-actions',
          label: 'Bulk Actions',
          icon: 'CogIcon',
          variant: 'secondary' as const,
          onClick: () => setShowBulkActionsModal(true),
          disabled: selectedUsers.length === 0,
        },
        {
          id: 'export',
          label: 'Export Users',
          icon: 'ArrowDownTrayIcon',
          variant: 'secondary' as const,
          onClick: handleExportUsers,
          loading: exportUsersMutation.isPending,
        }
      ]}
      layout="wide"
    >
      <div className="space-y-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </Text>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stat.value.toLocaleString()}
                  </div>
                  <Text className="text-xs text-green-600 mt-1">
                    {stat.trend}
                  </Text>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon 
                    className={`w-6 h-6 text-${stat.color}-600`} 
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.is_active?.toString() || ''}
                onChange={(value) => setFilters(prev => ({
                  ...prev,
                  is_active: value ? value === 'true' : undefined
                }))}
                placeholder="All Status"
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ]}
              />
              <Select
                value={filters.is_verified?.toString() || ''}
                onChange={(value) => setFilters(prev => ({
                  ...prev,
                  is_verified: value ? value === 'true' : undefined
                }))}
                placeholder="All Verification"
                options={[
                  { value: '', label: 'All Verification' },
                  { value: 'true', label: 'Verified' },
                  { value: 'false', label: 'Unverified' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <Heading size="lg">Users ({metadata.total_items || 0})</Heading>
                {selectedUsers.length > 0 && (
                  <Text className="text-sm text-gray-600 mt-1">
                    {selectedUsers.length} users selected
                  </Text>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table
              data={users}
              columns={columns}
              loading={usersLoading}
              sortable={true}
              showColumnControls={true}
              onRowClick={(user: any) => navigate({ to: `/users/users/${user.id}` })}
              emptyMessage="No users found"
              className="w-full"
            />
            
            {/* Pagination */}
            {metadata.total_pages > 1 && (
              <div className="flex justify-between items-center mt-6 px-6 pb-6">
                <Text className="text-sm text-gray-700">
                  Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, metadata.total_items || 0)} of {metadata.total_items || 0} results
                </Text>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={!metadata.has_previous}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!metadata.has_next}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActionsModal && (
        <Modal
          isOpen={showBulkActionsModal}
          onClose={() => setShowBulkActionsModal(false)}
          title="Bulk Actions"
          size="medium"
        >
          <div className="p-6">
            <Text className="mb-4">
              Perform action on {selectedUsers.length} selected users:
            </Text>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full justify-start"
                onClick={() => handleBulkAction('activate')}
                isLoading={bulkActionMutation.isPending}
                leftIcon={<PlayIcon className="w-4 h-4" />}
              >
                Activate Users
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => handleBulkAction('suspend')}
                isLoading={bulkActionMutation.isPending}
                leftIcon={<PauseIcon className="w-4 h-4" />}
              >
                Suspend Users
              </Button>
              <Button
                variant="danger"
                className="w-full justify-start"
                onClick={() => handleBulkAction('delete')}
                isLoading={bulkActionMutation.isPending}
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                Delete Users
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </PageTemplate>
  );
};

export default UserManagement;
