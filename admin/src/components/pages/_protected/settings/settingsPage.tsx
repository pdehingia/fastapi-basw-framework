/**
 * Settings Page Component
 * Platform configuration and administrative settings
 */

import React, { useState } from 'react';
import { 
  Button, 
  Heading, 
  Text, 
  Badge 
} from '@/components/atoms';
import { 
  Card, 
  CardHeader, 
  CardBody,
  Modal 
} from '@/components/molecules';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  settings: Setting[];
}

interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  value: any;
  options?: { value: string; label: string }[];
  required?: boolean;
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock settings data - will be replaced with real API calls
  const settingSections: SettingSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic platform configuration',
      icon: '⚙️',
      settings: [
        {
          key: 'platform_name',
          label: 'Platform Name',
          description: 'The name of your Maya platform instance',
          type: 'string',
          value: 'Maya Admin Portal',
          required: true,
        },
        {
          key: 'maintenance_mode',
          label: 'Maintenance Mode',
          description: 'Enable to take the platform offline for maintenance',
          type: 'boolean',
          value: false,
        },
        {
          key: 'max_users',
          label: 'Maximum Users',
          description: 'Maximum number of users allowed on the platform',
          type: 'number',
          value: 10000,
          required: true,
        },
        {
          key: 'default_timezone',
          label: 'Default Timezone',
          description: 'Default timezone for the platform',
          type: 'select',
          value: 'UTC',
          options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' },
            { value: 'Europe/London', label: 'GMT' },
            { value: 'Asia/Tokyo', label: 'Japan Time' },
          ],
        },
      ],
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Authentication and security configuration',
      icon: '🔒',
      settings: [
        {
          key: 'require_2fa',
          label: 'Require Two-Factor Authentication',
          description: 'Force all users to enable 2FA',
          type: 'boolean',
          value: true,
        },
        {
          key: 'password_min_length',
          label: 'Minimum Password Length',
          description: 'Minimum required password length',
          type: 'number',
          value: 8,
          required: true,
        },
        {
          key: 'session_timeout',
          label: 'Session Timeout (hours)',
          description: 'Automatic logout after inactivity',
          type: 'number',
          value: 24,
        },
        {
          key: 'allowed_domains',
          label: 'Allowed Email Domains',
          description: 'Comma-separated list of allowed email domains',
          type: 'string',
          value: '',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Email and push notification configuration',
      icon: '🔔',
      settings: [
        {
          key: 'email_notifications',
          label: 'Email Notifications',
          description: 'Enable email notifications for platform events',
          type: 'boolean',
          value: true,
        },
        {
          key: 'push_notifications',
          label: 'Push Notifications',
          description: 'Enable browser push notifications',
          type: 'boolean',
          value: true,
        },
        {
          key: 'notification_frequency',
          label: 'Notification Frequency',
          description: 'How often to send digest notifications',
          type: 'select',
          value: 'daily',
          options: [
            { value: 'immediate', label: 'Immediate' },
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'never', label: 'Never' },
          ],
        },
      ],
    },
    {
      id: 'api',
      title: 'API Settings',
      description: 'API configuration and rate limiting',
      icon: '🔗',
      settings: [
        {
          key: 'api_rate_limit',
          label: 'API Rate Limit (requests/minute)',
          description: 'Maximum API requests per minute per user',
          type: 'number',
          value: 100,
        },
        {
          key: 'api_versioning',
          label: 'API Version',
          description: 'Current API version',
          type: 'select',
          value: 'v1',
          options: [
            { value: 'v1', label: 'Version 1.0' },
            { value: 'v2', label: 'Version 2.0' },
          ],
        },
        {
          key: 'cors_origins',
          label: 'CORS Origins',
          description: 'Comma-separated list of allowed CORS origins',
          type: 'string',
          value: '*',
        },
      ],
    },
  ];

  const currentSection = settingSections.find(s => s.id === activeSection) || settingSections[0];

  const handleSettingChange = (key: string, value: any) => {
    console.log('Setting changed:', key, value);
    setHasChanges(true);
    // In a real app, you would update the settings state here
  };

  const handleSave = () => {
    console.log('Saving settings...');
    setShowSaveModal(false);
    setHasChanges(false);
    // API call would go here
  };

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value) || 0)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={setting.required}
          />
        );
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={setting.required}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Heading as="h1" size="2xl" className="text-gray-900">
            Platform Settings
          </Heading>
          <Text color="muted" className="mt-1">
            Configure and manage your Maya platform settings.
          </Text>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <Badge variant="warning" size="sm">
              Unsaved Changes
            </Badge>
          )}
          <Button 
            variant="primary" 
            size="sm"
            disabled={!hasChanges}
            onClick={() => setShowSaveModal(true)}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currentSection.icon}</span>
                <div>
                  <Heading as="h2" size="lg">{currentSection.title}</Heading>
                  <Text color="muted">{currentSection.description}</Text>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {currentSection.settings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text variant="body" className="font-medium text-gray-900">
                          {setting.label}
                          {setting.required && <span className="text-red-500 ml-1">*</span>}
                        </Text>
                        <Text variant="caption" color="muted">
                          {setting.description}
                        </Text>
                      </div>
                    </div>
                    <div className="max-w-md">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Settings"
      >
        <div className="space-y-4">
          <Text>
            Are you sure you want to save these settings? Some changes may require a platform restart to take effect.
          </Text>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;