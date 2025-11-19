/**
 * Add Admin User Modal
 * Form to create new admin users with role assignment
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useCreateAdminUser } from '@/hooks/api/useAdminUsers';
import { toast } from '@/services/toast';

const adminUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['super_admin', 'admin', 'moderator'], {
    required_error: 'Role is required'
  }),
  department: z.string().optional(),
  phone: z.string().optional(),
  send_welcome_email: z.boolean().default(true),
});

type AdminUserFormData = z.infer<typeof adminUserSchema>;

interface AddAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAdminUserModal: React.FC<AddAdminUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const createAdminUserMutation = useCreateAdminUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      send_welcome_email: true,
    }
  });

  const onSubmit = async (data: AdminUserFormData) => {
    try {
      await createAdminUserMutation.mutateAsync(data);
      toast.success('Admin user created successfully');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error('Failed to create admin user');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Admin User"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              name="first_name"
              required
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            
            <FormField
              label="Last Name"
              name="last_name"
              required
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <FormField
            label="Email Address"
            name="email"
            type="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <FormField
            label="Phone Number"
            name="phone"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        {/* Role & Department */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Role & Department</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a role</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            <FormField
              label="Department"
              name="department"
              error={errors.department?.message}
              {...register('department')}
            />
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Role Descriptions</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div><strong>Moderator:</strong> Can view and moderate content, limited administrative access</div>
            <div><strong>Admin:</strong> Full administrative access except super admin functions</div>
            <div><strong>Super Admin:</strong> Full system access including admin user management</div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="send_welcome_email"
              {...register('send_welcome_email')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="send_welcome_email" className="ml-2 block text-sm text-gray-700">
              Send welcome email with login instructions
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || createAdminUserMutation.isPending}
          >
            Create Admin User
          </Button>
        </div>
      </form>
    </Modal>
  );
};