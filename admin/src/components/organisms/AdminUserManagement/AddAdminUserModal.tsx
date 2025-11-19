/**
 * Add Admin User Modal
 * Form for creating new admin users
 */

import { useState } from 'react';
import { Button } from '../../atoms';
import { Modal, FormField } from '../../molecules';
import { useCreateAdminUser } from '../../../hooks/api/useAdminUsers';
import type { CreateAdminUserRequest } from '../../../types/api.types';

interface AddAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAdminUserModal = ({ isOpen, onClose, onSuccess }: AddAdminUserModalProps) => {
  const [formData, setFormData] = useState<CreateAdminUserRequest>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'moderator',
    department: '',
    phone: '',
    send_welcome_email: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createAdminUserMutation = useCreateAdminUser();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createAdminUserMutation.mutateAsync(formData);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating admin user:', error);
      // Error is handled by the hook and toast
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'moderator',
      department: '',
      phone: '',
      send_welcome_email: true
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateFormData = (field: keyof CreateAdminUserRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Admin User"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <FormField
            label="First Name"
            name="first_name"
            type="text"
            value={formData.first_name}
            required
            error={errors.first_name}
            placeholder="Enter first name"
            onChange={(e) => updateFormData('first_name', e.target.value)}
          />

          {/* Last Name */}
          <FormField
            label="Last Name"
            name="last_name"
            type="text"
            value={formData.last_name}
            required
            error={errors.last_name}
            placeholder="Enter last name"
            onChange={(e) => updateFormData('last_name', e.target.value)}
          />
        </div>

        {/* Email */}
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          required
          error={errors.email}
          placeholder="Enter email address"
          onChange={(e) => updateFormData('email', e.target.value)}
        />

        {/* Phone */}
        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone || ''}
          placeholder="Enter phone number"
          onChange={(e) => updateFormData('phone', e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role */}
          <FormField
            label="Role"
            name="role"
            type="select"
            value={formData.role}
            required
            error={errors.role}
            options={[
              { value: 'moderator', label: 'Moderator' },
              { value: 'admin', label: 'Admin' },
              { value: 'super_admin', label: 'Super Admin' }
            ]}
            onChange={(e) => updateFormData('role', e.target.value as any)}
          />

          {/* Department */}
          <FormField
            label="Department"
            name="department"
            type="select"
            value={formData.department || ''}
            placeholder="Select Department"
            options={[
              { value: '', label: 'Select Department' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Product', label: 'Product' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Support', label: 'Support' },
              { value: 'Finance', label: 'Finance' },
              { value: 'HR', label: 'Human Resources' },
              { value: 'Legal', label: 'Legal' }
            ]}
            onChange={(e) => updateFormData('department', e.target.value)}
          />
        </div>

        {/* Welcome Email Option */}
        <FormField
          label="Send welcome email with login instructions"
          name="send_welcome_email"
          type="checkbox"
          value={formData.send_welcome_email || false}
          onChange={(e) => updateFormData('send_welcome_email', (e.target as HTMLInputElement).checked)}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={createAdminUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createAdminUserMutation.isPending}
          >
            {createAdminUserMutation.isPending ? 'Creating...' : 'Create Admin User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};