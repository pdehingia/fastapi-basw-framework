/**
 * Admin User Detail Page
 * Displays detailed information about a specific admin user
 */

import { useState } from 'react';
import { DashboardLayout } from '../../templates';
import { Button, Spinner } from '../../atoms';
import { Modal } from '../../molecules';
// import { AdminActivityLogs } from './AdminActivityLogs';
import { useAdminUser, useUpdateAdminUser, useDeleteAdminUser } from '../../../hooks/api/useAdminUsers';
import { 
  PencilIcon, 
  TrashIcon, 
  ShieldCheckIcon, 
  CalendarIcon, 
  ClockIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import type { UpdateAdminUserRequest } from '../../../types/api.types';

export const AdminUserDetailPage = () => {
  // For now, use a dummy ID - this will be fixed when router is properly configured
  const adminUserId = 'sample-user-id';
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  // API hooks
  const { data: adminUser, isLoading, refetch } = useAdminUser(adminUserId);
  const updateAdminUserMutation = useUpdateAdminUser();
  const deleteAdminUserMutation = useDeleteAdminUser();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!adminUser) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Admin User Not Found</h3>
          <p className="text-gray-500">The requested admin user could not be found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleDeleteUser = async () => {
    try {
      await deleteAdminUserMutation.mutateAsync(adminUserId);
      setShowDeleteModal(false);
      // Navigate back to users list
      window.location.href = '/admin-users';
    } catch (error) {
      console.error('Error deleting admin user:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      navigationProps={{
        title: `${adminUser.first_name} ${adminUser.last_name}`,
        breadcrumbs: [
          { id: 'home', label: 'Home', href: '/dashboard' },
          { id: 'admin-users', label: 'Admin Users', href: '/admin-users' },
          { 
            id: 'admin-user-detail', 
            label: `${adminUser.first_name} ${adminUser.last_name}`, 
            current: true 
          },
        ],
        actions: [
          {
            id: 'edit-admin-user',
            label: 'Edit User',
            icon: 'PencilIcon',
            variant: 'secondary',
            onClick: () => setShowEditModal(true),
          },
          {
            id: 'delete-admin-user',
            label: 'Delete User',
            icon: 'TrashIcon',
            variant: 'danger',
            onClick: () => setShowDeleteModal(true),
          },
        ],
      }}
    >
      <div className="space-y-6">
        {/* User Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-xl font-medium text-blue-600">
                  {adminUser.first_name?.[0]}{adminUser.last_name?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {adminUser.first_name} {adminUser.last_name}
                </h1>
                <p className="text-gray-600">{adminUser.email}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(adminUser.role)}`}>
                    {adminUser.role.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(adminUser.status)}`}>
                    {adminUser.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(true)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity Log
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">{adminUser.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">{adminUser.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{adminUser.email}</p>
                    </div>
                    {adminUser.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{adminUser.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role & Access Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Role & Access
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(adminUser.role)}`}>
                          {adminUser.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(adminUser.status)}`}>
                          {adminUser.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    {adminUser.department && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <p className="mt-1 text-sm text-gray-900">{adminUser.department}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Activity Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(adminUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {adminUser.last_login && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Login</label>
                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(adminUser.last_login).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Updated At</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(adminUser.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Activity logs component will be implemented in the next iteration.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal - Simple version for now */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Admin User"
          size="large"
        >
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Edit functionality will be implemented in the next iteration.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowEditModal(false)}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Admin User"
          size="medium"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the admin user "{adminUser.first_name} {adminUser.last_name}"? 
              This action cannot be undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Deleting this admin user will revoke all their access 
                and cannot be undone. Consider deactivating the user instead.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteUser}
                disabled={deleteAdminUserMutation.isPending}
              >
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};