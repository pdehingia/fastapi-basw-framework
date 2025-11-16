/**
 * User Detail Page Route
 * Individual user details and management with parameter validation
 */

/**
 * User Detail Page Route
 * Individual user details and management with parameter validation using TanStack Query
 */

import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/templates';
import { Spinner } from '@/components/atoms';
import { useUser, useUpdateUser, useDeleteUser } from '@/hooks/api/useUsers';
import { User } from '@/types/api.types';
import { z } from 'zod';
import { ROUTES } from '@/config/routes';
import React, { useState } from 'react';

// Parameter validation schema
const userParamsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Search parameters schema - all optional
const userSearchSchema = z.object({
  tab: z.enum(['profile', 'activity', 'settings']).optional().default('profile'),
});

function UserDetailWithLayout() {
  const { userId } = Route.useParams();
  const search = Route.useSearch();
  const [activeTab, setActiveTab] = useState(search?.tab || 'profile');
  
  const { data: user, isLoading, error, refetch } = useUser(userId);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer' as User['role'],
    status: 'active' as User['status'],
  });

  // Update form data when user data loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleSave = () => {
    updateUserMutation.mutate(
      { id: userId, data: formData },
      {
        onSuccess: () => {
          setIsEditing(false);
        }
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        navigationProps={{
          title: 'Loading User...',
          breadcrumbs: [
            { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
            { id: 'users', label: 'Users', href: ROUTES.USERS },
            { id: 'user-detail', label: 'Loading...', current: true },
          ],
        }}
      >
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading user details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout
        navigationProps={{
          title: 'Error',
          breadcrumbs: [
            { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
            { id: 'users', label: 'Users', href: ROUTES.USERS },
            { id: 'error', label: 'Error', current: true },
          ],
        }}
      >
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
          <p className="text-red-600 mb-4">Failed to load user details</p>
          <p className="text-sm text-gray-500">{error?.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'activity', name: 'Activity', icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <DashboardLayout
      navigationProps={{
        title: `User: ${user.fullName}`,
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'users', label: 'Users', href: ROUTES.USERS },
          { id: 'user-detail', label: user.fullName, current: true },
        ],
        actions: [
          {
            id: 'edit-user',
            label: isEditing ? 'Cancel' : 'Edit User',
            icon: isEditing ? 'XMarkIcon' : 'PencilIcon',
            variant: isEditing ? 'secondary' : 'primary',
            onClick: () => {
              setIsEditing(!isEditing);
              if (isEditing) {
                // Reset form data
                setFormData({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone || '',
                  role: user.role,
                  status: user.status,
                });
              }
            },
          },
          ...(isEditing ? [
            {
              id: 'save-user',
              label: 'Save Changes',
              icon: 'CheckIcon',
              variant: 'primary' as const,
              onClick: handleSave,
              disabled: updateUserMutation.isPending,
            }
          ] : [
            {
              id: 'delete-user',
              label: 'Delete User',
              icon: 'TrashIcon',
              variant: 'danger' as const,
              onClick: handleDelete,
              disabled: deleteUserMutation.isPending,
            }
          ]),
        ],
        showBackButton: true,
      }}
    >
      <div className="space-y-6">
        {/* User Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-6">
            <img
              className="h-20 w-20 rounded-full"
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3B82F6&color=fff`}
              alt={user.fullName}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-2 flex space-x-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  user.role === 'provider' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                  user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  {isEditing ? (
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="provider">Provider</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{user.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  {isEditing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{user.status}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-gray-900">{new Date(user.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Activity tracking coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">User Settings</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">User-specific settings coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_protected/users/$userId')({
  component: UserDetailWithLayout,
  
  // Validate URL parameters
  parseParams: (params) => userParamsSchema.parse(params),
  
  // Validate search parameters  
  validateSearch: (search) => userSearchSchema.parse(search),
  
  // Loading component
  pendingComponent: () => (
    <DashboardLayout
      navigationProps={{
        title: 'Loading User...',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'users', label: 'Users', href: ROUTES.USERS },
          { id: 'user-detail', label: 'Loading...', current: true },
        ],
      }}
    >
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </DashboardLayout>
  ),
  
  // Error component
  errorComponent: ({ error }) => (
    <DashboardLayout
      navigationProps={{
        title: 'Error',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'users', label: 'Users', href: ROUTES.USERS },
          { id: 'error', label: 'Error', current: true },
        ],
      }}
    >
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load user details</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    </DashboardLayout>
  ),
});