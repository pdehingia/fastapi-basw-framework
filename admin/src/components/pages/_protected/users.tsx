/**
 * User List Page Route
 * User management list with search and filters
 * Enhanced with search params and loading states
 */

/**
 * User List Page Route
 * User management list with search and filters
 * Enhanced with search params and loading states using TanStack Query
 */

import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/templates';
import { Spinner } from '@/components/atoms';
import { useUsers, useDeleteUser } from '@/hooks/api/useUsers';
import { z } from 'zod';
import { ROUTES } from '@/config/routes';

// Search parameters schema - all optional
const usersSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  role: z.enum(['admin', 'customer', 'manager', 'provider']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
}).optional();

function UserListWithLayout() {
  const search = Route.useSearch();
  // TODO: Implement bulk selection and status changes
  // const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { 
    data: users, 
    isLoading, 
    error,
    refetch 
  } = useUsers({
    page: search?.page || 1,
    limit: search?.limit || 10,
    search: search?.search,
    role: search?.role,
    status: search?.status,
  });

  const deleteUserMutation = useDeleteUser();
  // TODO: Implement user updates
  // const updateUserMutation = useUpdateUser();

  if (isLoading) {
    return (
      <DashboardLayout
        navigationProps={{
          title: 'User Management',
          breadcrumbs: [
            { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
            { id: 'users', label: 'Users', current: true },
          ],
        }}
      >
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        navigationProps={{
          title: 'User Management - Error',
          breadcrumbs: [
            { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
            { id: 'users', label: 'Users', current: true },
          ],
        }}
      >
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Users Error</h3>
          <p className="text-red-600 mb-4">Failed to load users</p>
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

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // TODO: Implement status change functionality
  // const handleStatusChange = (userId: string, status: 'active' | 'inactive' | 'suspended') => {
  //   updateUserMutation.mutate({ id: userId, data: { status } });
  // };

  return (
    <DashboardLayout
      navigationProps={{
        title: 'User Management',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'users', label: 'Users', current: true },
        ],
        actions: [
          {
            id: 'add-user',
            label: 'Add User',
            icon: 'PlusIcon',
            variant: 'primary',
            onClick: () => {
              console.log('Add user clicked');
            },
          },
        ],
      }}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search users..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="manager">Manager</option>
              <option value="provider">Provider</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3B82F6&color=fff`}
                          alt={user.fullName}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'provider' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => console.log('View user', user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => console.log('Edit user', user.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteUserMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {users?.pagination && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={!users.pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={!users.pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(users.pagination.page - 1) * users.pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(users.pagination.page * users.pagination.limit, users.pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{users.pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      disabled={!users.pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      disabled={!users.pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_protected/users')({
  component: UserListWithLayout,
  
  // Validate search parameters
  validateSearch: (search) => usersSearchSchema.parse(search),
  
  // Loading component
  pendingComponent: () => (
    <DashboardLayout
      navigationProps={{
        title: 'User Management',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'users', label: 'Users', current: true },
        ],
      }}
    >
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    </DashboardLayout>
  ),
  
  // Error component
  errorComponent: ({ error }) => (
    <DashboardLayout
      navigationProps={{
        title: 'User Management - Error',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'users', label: 'Users', current: true },
        ],
      }}
    >
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Users Error</h3>
        <p className="text-red-600 mb-4">Failed to load users</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    </DashboardLayout>
  ),
});