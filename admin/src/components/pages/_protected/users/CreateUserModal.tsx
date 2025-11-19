import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { Button, Input, Heading, Text } from '@/components/atoms';
import { Modal } from '@/components/molecules';
import { userService } from '@/services/api';
import { toast } from '@/services/toast';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    department: '',
    employee_id: '',
    role: 'admin', // admin or super_admin
    can_manage_users: false,
    can_manage_system: false,
    can_view_reports: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
      toast.success('User created successfully');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      
      // Handle validation errors
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          const newErrors: Record<string, string> = {};
          detail.forEach((err: any) => {
            if (err.loc && err.msg) {
              const field = err.loc[err.loc.length - 1];
              newErrors[field] = err.msg;
            }
          });
          setErrors(newErrors);
        } else if (typeof detail === 'string') {
          toast.error(detail);
        } else {
          toast.error('Failed to create user');
        }
      } else {
        toast.error('Failed to create user');
      }
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.username) newErrors.username = 'Username is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`,
      is_superuser: formData.role === 'super_admin',
    };

    createUserMutation.mutate(userData);
  };

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      username: '',
      phone: '',
      department: '',
      employee_id: '',
      role: 'admin',
      can_manage_users: false,
      can_manage_system: false,
      can_view_reports: false,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Admin User"
      size="large"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <Heading size="md" className="mb-4">Basic Information</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name *
                </label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <Text className="text-sm text-red-600 mt-1">{errors.first_name}</Text>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name *
                </label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <Text className="text-sm text-red-600 mt-1">{errors.last_name}</Text>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username *
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <Text className="text-sm text-red-600 mt-1">{errors.username}</Text>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <Text className="text-sm text-red-600 mt-1">{errors.email}</Text>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Employee ID
                </label>
                <Input
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="Enter employee ID"
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <Heading size="md" className="mb-4">Account Security</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <Text className="text-sm text-red-600 mt-1">{errors.password}</Text>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password *
                </label>
                <Input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  placeholder="Confirm password"
                />
                {errors.confirm_password && (
                  <Text className="text-sm text-red-600 mt-1">{errors.confirm_password}</Text>
                )}
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div>
            <Heading size="md" className="mb-4">Role & Permissions</Heading>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="IT Administration">IT Administration</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Content Management">Content Management</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <Text className="text-sm text-gray-600 mt-1">
                  Super Admins have full system access and can manage other admins
                </Text>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Specific Permissions
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.can_manage_users}
                      onChange={(e) => handleInputChange('can_manage_users', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <Text className="font-medium">Manage Users</Text>
                      <Text className="text-sm text-gray-600">Create, edit, and manage user accounts</Text>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.can_manage_system}
                      onChange={(e) => handleInputChange('can_manage_system', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <Text className="font-medium">Manage System</Text>
                      <Text className="text-sm text-gray-600">Access system settings and configurations</Text>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.can_view_reports}
                      onChange={(e) => handleInputChange('can_view_reports', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <Text className="font-medium">View Reports</Text>
                      <Text className="text-sm text-gray-600">Access analytics and reporting features</Text>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createUserMutation.isPending}
              disabled={createUserMutation.isPending}
              leftIcon={<UserPlusIcon className="w-4 h-4" />}
            >
              Create User
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;