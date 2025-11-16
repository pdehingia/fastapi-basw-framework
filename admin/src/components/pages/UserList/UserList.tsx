/**
 * UserList Page Component
 * Displays and manages the list of users in the system
 */

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Button, 
  Heading, 
  Text, 
  Badge, 
  Avatar 
} from '@/components/atoms';
import { ROUTES } from '@/config/routes';
import { 
  Card, 
  CardBody, 
  SearchBox, 
  Dropdown,
  Pagination,
  Modal 
} from '@/components/molecules';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'customer' | 'provider';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  avatar?: string;
}

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock data - will be replaced with real API calls
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: new Date('2024-01-15T10:30:00'),
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'customer',
      status: 'active',
      lastLogin: new Date('2024-01-14T15:45:00'),
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      role: 'provider',
      status: 'inactive',
      lastLogin: new Date('2024-01-12T09:20:00'),
    },
    {
      id: 4,
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      role: 'manager',
      status: 'active',
      lastLogin: new Date('2024-01-15T14:10:00'),
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'customer',
      status: 'suspended',
      lastLogin: new Date('2024-01-10T11:30:00'),
    },
  ];

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'customer', label: 'Customer' },
    { value: 'provider', label: 'Service Provider' },
  ];

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRoleVariant = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'provider': return 'primary';
      case 'customer': return 'info';
      default: return 'default';
    }
  };

  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter users based on search and role
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / 10);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * 10, currentPage * 10);

  const handleUserClick = (userId: number) => {
    navigate({ 
      to: ROUTES.USER_DETAIL, 
      params: { userId: userId.toString() },
      search: { tab: 'profile' }
    });
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting user:', selectedUser);
    setShowDeleteModal(false);
    setSelectedUser(null);
    // API call would go here
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="flex-1 max-w-md">
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search users by name or email..."
            />
          </div>
          <div className="min-w-[180px]">
            <Dropdown
              value={selectedRole}
              onSelect={(value) => setSelectedRole(value)}
              options={roleOptions}
              placeholder="Filter by role"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Total Users</Text>
              <Heading as="h3" size="lg" className="text-blue-600">
                {mockUsers.length}
              </Heading>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Active</Text>
              <Heading as="h3" size="lg" className="text-green-600">
                {mockUsers.filter(u => u.status === 'active').length}
              </Heading>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Inactive</Text>
              <Heading as="h3" size="lg" className="text-yellow-600">
                {mockUsers.filter(u => u.status === 'inactive').length}
              </Heading>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Suspended</Text>
              <Heading as="h3" size="lg" className="text-red-600">
                {mockUsers.filter(u => u.status === 'suspended').length}
              </Heading>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardBody>
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Text color="muted">No users found matching your criteria.</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="md"
                    />
                    <div>
                      <Text variant="body" className="font-medium text-gray-900">
                        {user.name}
                      </Text>
                      <Text variant="caption" color="muted">
                        {user.email}
                      </Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <Badge variant={getRoleVariant(user.role)} size="sm">
                        {user.role}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={getStatusVariant(user.status)} size="sm">
                        {user.status}
                      </Badge>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <Text variant="caption" color="muted">
                        {formatLastLogin(user.lastLogin)}
                      </Text>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user.id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <Text>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
            This action cannot be undone.
          </Text>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;