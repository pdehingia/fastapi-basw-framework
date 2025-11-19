/**
 * Admin Users List Page
 * Displays and manages all admin users with CRUD operations
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/templates';
import { DataTable } from '@/components/organisms/DataTable';
import { Button } from '@/components/atoms';
import { Modal, SearchBox } from '@/components/molecules';
import { AddAdminUserModal } from './AddAdminUserModal';
import { useAdminUsers, useDeleteAdminUser, useUpdateAdminUserStatus } from '@/hooks/api/useAdminUsers';
import { toast } from '@/services/toast';
import { EyeIcon, PencilIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import type { AdminUser, AdminUserFilters } from '@/types/api.types';

export const AdminUsersListPage = () => {
  const [filters, setFilters] = useState<AdminUserFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // API hooks
  const { data: adminUsersData, isLoading, refetch } = useAdminUsers(filters);
  const deleteAdminUserMutation = useDeleteAdminUser();
  const updateStatusMutation = useUpdateAdminUserStatus();

  const adminUsers = adminUsersData?.items || [];
  const totalCount = adminUsersData?.total || 0;

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<AdminUserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteAdminUserMutation.mutateAsync(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      refetch();
      toast.success('Admin user deleted successfully');
    } catch (error) {
      console.error('Error deleting admin user:', error);
    }
  };

  const handleStatusToggle = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    try {
      await updateStatusMutation.mutateAsync({
        id: user.id,
        status: newStatus,
        reason: `Status changed from ${user.status} to ${newStatus}`
      });
      refetch();
      toast.success(`Admin user ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating admin user status:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_: any, user: AdminUser) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (_: any, user: AdminUser) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'super_admin' 
            ? 'bg-purple-100 text-purple-800'
            : user.role === 'admin'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {user.role.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (_: any, user: AdminUser) => user.department || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, user: AdminUser) => (
        <button
          onClick={() => handleStatusToggle(user)}
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
            user.status === 'active'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {user.status.toUpperCase()}
        </button>
      )
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (_: any, user: AdminUser) => 
        user.last_login 
          ? new Date(user.last_login).toLocaleDateString()
          : 'Never'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, user: AdminUser) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/admin-users/${user.id}`, '_blank')}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              // TODO: Implement edit modal
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              setSelectedUser(user);
              setShowDeleteModal(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout
      navigationProps={{
        title: 'Admin User Management',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: '/dashboard' },
          { id: 'admin-users', label: 'Admin Users', current: true },
        ],
        actions: [
          {
            id: 'add-admin-user',
            label: 'Add Admin User',
            icon: 'UserPlusIcon',
            variant: 'primary',
            onClick: () => setShowAddModal(true),
          },
        ],
      }}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
            <p className="text-gray-600">Manage admin users, roles, and permissions</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Admin User
          </Button>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <SearchBox
                placeholder="Search admin users..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleFilterChange({ role: (e.target.value || undefined) as 'super_admin' | 'admin' | 'moderator' | undefined })}
                value={filters.role || ''}
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleFilterChange({ status: (e.target.value || undefined) as 'active' | 'inactive' | 'suspended' | undefined })}
                value={filters.status || ''}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <DataTable
            data={adminUsers}
            columns={columns}
            loading={isLoading}
            pagination={{
              currentPage: page,
              totalPages: Math.ceil((adminUsersData?.metadata?.total_items ?? 0) / pageSize),
              totalItems: adminUsersData?.metadata?.total_items ?? 0,
              pageSize: pageSize,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            sorting={{
              sortBy: sortBy || undefined,
              sortOrder: sortOrder,
              onSort: (key: string) => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(key);
                  setSortOrder('asc');
                }
              }
            }}
          />
        </div>
      </div>

      {/* Add Admin User Modal */}
      {showAddModal && (
        <AddAdminUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          title="Delete Admin User"
          size="medium"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the admin user "{selectedUser.first_name} {selectedUser.last_name}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteUser}
                isLoading={deleteAdminUserMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};