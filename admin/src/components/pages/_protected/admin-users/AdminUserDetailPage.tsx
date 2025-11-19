/**
 * Admin User Detail Page
 * Detailed view of individual admin user with activity logs and management options
 */

import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/templates';
import { Button, Badge, Spinner, Heading } from '@/components/atoms';
import { Card, Modal } from '@/components/molecules';
import { AdminActivityLogs } from './AdminActivityLogs';
import { useAdminUser, useUpdateAdminUser, useDeleteAdminUser } from '@/hooks/api/useAdminUsers';
import { toast } from '@/services/toast';
import { 
  PencilIcon, 
  TrashIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export const AdminUserDetailPage = () => {
  const { adminUserId } = useParams({ from: '/_protected/admin-users/admin-users/$adminUserId' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // API hooks
  const { data: adminUser, isLoading, error, refetch } = useAdminUser(adminUserId);
  const updateAdminUserMutation = useUpdateAdminUser();
  const deleteAdminUserMutation = useDeleteAdminUser();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !adminUser) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin User Not Found</h1>
          <p className="text-gray-600">The admin user you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusToggle = async () => {
    const newStatus = adminUser.status === 'active' ? 'inactive' : 'active';
    
    try {
      await updateAdminUserMutation.mutateAsync({
        id: adminUser.id,
        data: { status: newStatus }
      });
      refetch();
      toast.success(`Admin user ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating admin user status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAdminUserMutation.mutateAsync(adminUser.id);
      toast.success('Admin user deleted successfully');
      // Navigate back to admin users list
      window.history.back();
    } catch (error) {
      console.error('Error deleting admin user:', error);
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
            variant: 'primary',
            onClick: () => setShowEditModal(true),
          },
          {
            id: 'delete-admin-user',
            label: 'Delete User',
            icon: 'TrashIcon',
            variant: 'secondary',
            className: 'text-red-600 hover:text-red-700',
            onClick: () => setShowDeleteModal(true),
          },
        ],
      }}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-blue-600">
                  {adminUser.first_name[0]}{adminUser.last_name[0]}
                </span>
              </div>
              <div>
                <Heading level={1} className="text-2xl font-bold text-gray-900">
                  {adminUser.first_name} {adminUser.last_name}
                </Heading>
                <p className="text-gray-600">{adminUser.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getRoleColor(adminUser.role)}>
                    {adminUser.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(adminUser.status)}>
                    {adminUser.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleStatusToggle}
                loading={updateAdminUserMutation.isPending}
              >
                {adminUser.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card
            title="Personal Information"
            icon={<UserIcon className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 w-20">Email:</span>
                <span className="text-gray-900">{adminUser.email}</span>
              </div>
              {adminUser.phone && (
                <div className="flex items-center text-sm">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 w-20">Phone:</span>
                  <span className="text-gray-900">{adminUser.phone}</span>
                </div>
              )}
              {adminUser.department && (
                <div className="flex items-center text-sm">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 w-20">Department:</span>
                  <span className="text-gray-900">{adminUser.department}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Access Information */}
          <Card
            title="Access Information"
            icon={<ShieldCheckIcon className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 w-24">Last Login:</span>
                <span className="text-gray-900">
                  {adminUser.last_login 
                    ? new Date(adminUser.last_login).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex items-center text-sm">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600 w-24">Created:</span>
                <span className="text-gray-900">
                  {new Date(adminUser.created_at).toLocaleString()}
                </span>
              </div>
              {adminUser.updated_at && (
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 w-24">Updated:</span>
                  <span className="text-gray-900">
                    {new Date(adminUser.updated_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Activity Logs */}
        <Card title="Activity Logs" className="w-full">
          <AdminActivityLogs adminUserId={adminUser.id} />
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Admin User"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the admin user "{adminUser.first_name} {adminUser.last_name}"? 
              This action cannot be undone and will revoke all access permissions.
            </p>
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
                onClick={handleDelete}
                loading={deleteAdminUserMutation.isPending}
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