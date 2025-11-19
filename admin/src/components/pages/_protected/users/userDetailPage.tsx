import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PencilIcon,
  BellIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { 
  Button, 
  Heading, 
  Text, 
  Badge,
  Input,
  Textarea
} from '@/components/atoms';
import { 
  Card, 
  CardHeader, 
  CardBody,
  Modal,
  Table
} from '@/components/molecules';
import { userService } from '@/services/api';
import { toast } from '@/services/toast';

interface UserDetailPageProps {
  userId: string;
}

const UserDetailPage: React.FC<UserDetailPageProps> = ({ userId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
  });
  const [notificationForm, setNotificationForm] = useState({
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    send_email: true,
    send_sms: false,
  });

  // API Queries
  const { 
    data: userData, 
    isLoading: userLoading,
    error: userError 
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  });

  const { 
    data: activityData, 
    isLoading: activityLoading 
  } = useQuery({
    queryKey: ['userActivity', userId, activeTab],
    queryFn: () => userService.getUserActivity(userId, { page: 1, page_size: 10 }),
    enabled: !!userId && activeTab === 'activity',
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: (updates: any) => userService.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setShowEditModal(false);
    },
    onError: (error) => {
      console.error('Update user error:', error);
      toast.error('Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      navigate({ to: '/users', search: { page: 1, limit: 10 } });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: 'active' | 'inactive' | 'suspended'; reason?: string }) => 
      userService.updateUserStatus(userId, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      console.error('Update status error:', error);
      toast.error('Failed to update user status');
    },
  });

  const notificationMutation = useMutation({
    mutationFn: (notification: any) => userService.sendUserNotification(userId, notification),
    onSuccess: () => {
      toast.success('Notification sent successfully');
      setShowNotificationModal(false);
      setNotificationForm({
        message: '',
        type: 'info',
        send_email: true,
        send_sms: false,
      });
    },
    onError: (error) => {
      console.error('Send notification error:', error);
      toast.error('Failed to send notification');
    },
  });

  const user = userData?.data;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'activity', label: 'Activity', icon: ChartBarIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
  ];

  const getRoleColor = (isSuper: boolean) => {
    return isSuper ? 'error' : 'primary';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'warning';
  };

  const handleEditUser = () => {
    if (!user) return;
    
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    updateUserMutation.mutate(editForm);
  };

  const handleStatusChange = (newStatus: 'active' | 'inactive' | 'suspended') => {
    const reason = newStatus === 'suspended' 
      ? prompt('Please provide a reason for suspension:') || undefined
      : undefined;
    
    if (newStatus === 'suspended' && !reason) return;
    
    updateStatusMutation.mutate({ status: newStatus, reason });
  };

  const handleDeleteUser = () => {
    deleteUserMutation.mutate();
    setShowDeleteModal(false);
  };

  const handleSendNotification = () => {
    notificationMutation.mutate(notificationForm);
  };

  const renderProfileTab = () => {
    if (!user) return null;

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Heading size="lg">Basic Information</Heading>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditUser}
                leftIcon={<PencilIcon className="w-4 h-4" />}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Full Name</Text>
                <Text className="font-medium">{user.full_name || user.username}</Text>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Email Address</Text>
                <Text className="font-medium">{user.email}</Text>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Phone Number</Text>
                <Text className="font-medium">{user.phone || 'Not provided'}</Text>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Username</Text>
                <Text className="font-medium">{user.username}</Text>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Department</Text>
                <Text className="font-medium">{user.department || 'Not assigned'}</Text>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Employee ID</Text>
                <Text className="font-medium">{user.employee_id || 'Not assigned'}</Text>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Member Since</Text>
                <Text className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-1">Last Updated</Text>
                <Text className="font-medium">
                  {new Date(user.updated_at).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <Heading size="lg">Account Status & Permissions</Heading>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-2">Role</Text>
                <Badge variant={getRoleColor(user.is_superuser)} size="sm">
                  {user.is_superuser ? 'Super Admin' : 'Admin'}
                </Badge>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-2">Status</Text>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(user.is_active)} size="sm">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.is_verified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-2">Permissions</Text>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    {user.can_manage_users ? (
                      <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <XMarkIcon className="w-4 h-4 mr-2 text-red-500" />
                    )}
                    Manage Users
                  </div>
                  <div className="flex items-center text-sm">
                    {user.can_manage_system ? (
                      <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <XMarkIcon className="w-4 h-4 mr-2 text-red-500" />
                    )}
                    Manage System
                  </div>
                  <div className="flex items-center text-sm">
                    {user.can_view_reports ? (
                      <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <XMarkIcon className="w-4 h-4 mr-2 text-red-500" />
                    )}
                    View Reports
                  </div>
                </div>
              </div>
              <div>
                <Text className="text-sm font-medium text-gray-600 mb-2">Last Login</Text>
                <Text className="font-medium">
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </Text>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <Heading size="lg">Actions</Heading>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowNotificationModal(true)}
                leftIcon={<BellIcon className="w-4 h-4" />}
              >
                Send Notification
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleStatusChange(user.is_active ? 'suspended' : 'active')}
                isLoading={updateStatusMutation.isPending}
                leftIcon={user.is_active ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              >
                {user.is_active ? 'Suspend User' : 'Activate User'}
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                Delete User
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderActivityTab = () => {
    const activities = activityData?.data || [];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Heading size="lg">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            {activityLoading ? (
              <div className="text-center py-8">
                <Text>Loading activity...</Text>
              </div>
            ) : activities.length > 0 ? (
              <Table
                data={activities}
                columns={[
                  {
                    key: 'timestamp',
                    header: 'Timestamp',
                    render: (activity: any) => new Date(activity.timestamp).toLocaleString(),
                  },
                  {
                    key: 'action',
                    header: 'Action',
                    render: (activity: any) => activity.action,
                  },
                  {
                    key: 'details',
                    header: 'Details',
                    render: (activity: any) => activity.details || '-',
                  },
                ]}
                loading={false}
              />
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Text className="text-gray-600">No activity recorded yet</Text>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Heading size="lg">Account Settings</Heading>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Text className="text-gray-600">Settings management coming soon...</Text>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'activity': return renderActivityTab();
      case 'settings': return renderSettingsTab();
      default: return renderProfileTab();
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <Text>Loading user details...</Text>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <Heading size="lg" className="mb-2">User Not Found</Heading>
        <Text className="text-gray-600 mb-4">
          The user you're looking for doesn't exist or has been deleted.
        </Text>
        <Button onClick={() => navigate({ to: '/users', search: { page: 1, limit: 10 } })}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <Heading size="2xl" className="text-gray-900">
              {user.full_name || user.username}
            </Heading>
            <div className="flex items-center space-x-3 mt-1">
              <Text className="text-gray-600">{user.email}</Text>
              <Badge variant={getRoleColor(user.is_superuser)} size="sm">
                {user.is_superuser ? 'Super Admin' : 'Admin'}
              </Badge>
              <Badge variant={getStatusColor(user.is_active)} size="sm">
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate({ to: '/users', search: { page: 1, limit: 10 } })}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back to Users
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="large"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <Input
                value={editForm.department}
                onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              isLoading={updateUserMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title="Send Notification"
        size="large"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              value={notificationForm.message}
              onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter notification message..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={notificationForm.type}
                onChange={(e) => setNotificationForm(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'info' | 'success' | 'warning' | 'error'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Options</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationForm.send_email}
                    onChange={(e) => setNotificationForm(prev => ({ 
                      ...prev, 
                      send_email: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  Send Email
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationForm.send_sms}
                    onChange={(e) => setNotificationForm(prev => ({ 
                      ...prev, 
                      send_sms: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  Send SMS
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNotificationModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNotification}
              isLoading={notificationMutation.isPending}
              disabled={!notificationForm.message}
            >
              Send Notification
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="medium"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3 text-red-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <Text className="font-semibold">Warning: This action cannot be undone</Text>
          </div>
          <Text>
            Are you sure you want to delete <strong>{user.full_name || user.username}</strong>? 
            This will permanently remove the user and all associated data.
          </Text>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              isLoading={deleteUserMutation.isPending}
              variant="danger"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailPage;