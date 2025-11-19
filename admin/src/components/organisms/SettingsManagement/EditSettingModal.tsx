/**
 * Edit Setting Modal
 * Modal for updating individual system settings
 */

import { useState } from 'react';
import { Button } from '../../atoms';
import { Modal, FormField } from '../../molecules';
import { useUpdateSystemSetting } from '@/hooks/api/useSettings';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import type { SystemSetting } from '../../../types/api.types';

interface EditSettingModalProps {
  isOpen: boolean;
  setting: SystemSetting;
  onClose: () => void;
  onSuccess: () => void;
}

interface SettingUpdateRequest {
  value: string;
  description?: string;
}

export const EditSettingModal = ({ isOpen, setting, onClose, onSuccess }: EditSettingModalProps) => {
  const [formData, setFormData] = useState<SettingUpdateRequest>({
    value: setting.value,
    description: setting.description
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateSettingMutation = useUpdateSystemSetting();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.value?.trim()) {
      newErrors.value = 'Value is required';
    }

    // Specific validations based on setting type
    if (setting.key.toLowerCase().includes('email')) {
      if (formData.value.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value)) {
        newErrors.value = 'Please enter a valid email address';
      }
    }

    if (setting.key.toLowerCase().includes('url')) {
      try {
        new URL(formData.value);
      } catch {
        if (!formData.value.startsWith('/')) {
          newErrors.value = 'Please enter a valid URL or path';
        }
      }
    }

    if (setting.key.toLowerCase().includes('port')) {
      const port = parseInt(formData.value);
      if (isNaN(port) || port < 1 || port > 65535) {
        newErrors.value = 'Port must be a number between 1 and 65535';
      }
    }

    if (setting.key.toLowerCase().includes('timeout')) {
      const timeout = parseInt(formData.value);
      if (isNaN(timeout) || timeout < 0) {
        newErrors.value = 'Timeout must be a positive number';
      }
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
      await updateSettingMutation.mutateAsync({
        key: setting.key,
        value: formData.value
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      value: setting.value,
      description: setting.description
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateFormData = (field: keyof SettingUpdateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSettingIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'email':
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'payment':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getValueInputType = (key: string): 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' => {
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
      return 'password';
    }
    if (key.toLowerCase().includes('email')) {
      return 'email';
    }
    if (key.toLowerCase().includes('url')) {
      return 'url';
    }
    if (key.toLowerCase().includes('port') || key.toLowerCase().includes('timeout') || key.toLowerCase().includes('limit')) {
      return 'number';
    }
    return 'text';
  };

  const getSuggestions = (key: string): string[] => {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('environment')) {
      return ['development', 'staging', 'production'];
    }
    if (keyLower.includes('log_level')) {
      return ['debug', 'info', 'warning', 'error'];
    }
    if (keyLower.includes('theme')) {
      return ['light', 'dark', 'auto'];
    }
    if (keyLower.includes('timezone')) {
      return ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    }
    if (keyLower.includes('language')) {
      return ['en', 'es', 'fr', 'de', 'it', 'pt'];
    }
    
    return [];
  };

  const suggestions = getSuggestions(setting.key);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit System Setting"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Setting Info */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center mb-2">
            {getSettingIcon(setting.category)}
            <span className="ml-2 text-sm font-medium text-gray-700">{setting.category}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">{setting.key}</h3>
          <p className="text-sm text-gray-600">{setting.description}</p>
        </div>

        {/* Current Value Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Value
          </label>
          <div className="bg-gray-100 p-3 rounded-md border">
            <code className="text-sm text-gray-800 break-all">{setting.value}</code>
          </div>
        </div>

        {/* New Value Input */}
        <FormField
          label="New Value"
          name="value"
          type={getValueInputType(setting.key)}
          value={formData.value}
          required
          error={errors.value}
          placeholder="Enter new value"
          onChange={(e) => updateFormData('value', e.target.value)}
          helpText={suggestions.length > 0 ? `Suggestions: ${suggestions.join(', ')}` : undefined}
        />

        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => updateFormData('value', suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Description Update */}
        <FormField
          label="Update Description (Optional)"
          name="description"
          type="textarea"
          value={formData.description || ''}
          rows={3}
          placeholder="Update the description if needed"
          onChange={(e) => updateFormData('description', e.target.value)}
        />

        {/* Warning for sensitive settings */}
        {(setting.key.toLowerCase().includes('password') || 
          setting.key.toLowerCase().includes('secret') || 
          setting.key.toLowerCase().includes('key') ||
          setting.category.toLowerCase() === 'security') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Security Setting</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a sensitive configuration. Changing this value may affect system security or functionality.
                  Please ensure you understand the implications before updating.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={updateSettingMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={updateSettingMutation.isPending}
          >
            {updateSettingMutation.isPending ? 'Updating...' : 'Update Setting'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};