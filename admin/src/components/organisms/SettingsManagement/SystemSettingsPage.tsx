/**
 * System Settings Page
 * Comprehensive system configuration and settings management
 */

import { useState } from 'react';
import { DashboardLayout } from '../../templates';
import { Button, Spinner } from '../../atoms';
import { SearchBox } from '../../molecules';
import DataTable from '../DataTable/DataTable';
import { EditSettingModal } from './EditSettingModal';
import { SystemHealthWidget } from './SystemHealthWidget';
import { useSettings } from '../../../hooks/api/useSettings';
import { 
  CogIcon, 
  PencilIcon, 
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import type { SystemSetting } from '../../../types/api.types';

interface SettingsFilters {
  search?: string;
  category?: string;
}

const SystemSettingsPage = () => {
  const [filters, setFilters] = useState<SettingsFilters>({});
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // API hooks
  const { data: settingsData, isLoading, refetch } = useSettings();

  // Client-side filtering
  const allSettings = settingsData || [];
  const settings = allSettings.filter(setting => {
    const matchesSearch = !filters.search || 
      setting.key.toLowerCase().includes(filters.search.toLowerCase()) ||
      setting.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      setting.value.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || setting.category === filters.category;
    
    return matchesSearch && matchesCategory;
  });
  
  const totalCount = settings.length;

  const handleEditSetting = (setting: SystemSetting) => {
    setSelectedSetting(setting);
    setShowEditModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    setSelectedSetting(null);
    refetch();
  };

  const getSettingIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'email':
        return <InformationCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'payment':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <CogIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getValuePreview = (value: string, maxLength = 50) => {
    if (value.length <= maxLength) return value;
    return `${value.substring(0, maxLength)}...`;
  };

  const columns = [
    {
      key: 'key',
      header: 'Setting Key',
      sortable: true,
      render: (setting: SystemSetting) => (
        <div className="flex items-center space-x-2">
          {getSettingIcon(setting.category)}
          <div>
            <div className="font-medium text-gray-900">{setting.key}</div>
            <div className="text-xs text-gray-500">{setting.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (setting: SystemSetting) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900">{setting.description}</p>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Current Value',
      render: (setting: SystemSetting) => (
        <div className="max-w-xs">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {getValuePreview(setting.value)}
          </code>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (setting: SystemSetting) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditSetting(setting)}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navigationProps={{
        title: 'System Settings',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: '/dashboard' },
          { id: 'settings', label: 'System Settings', current: true },
        ],
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure platform settings and system parameters</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {totalCount} settings
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FunnelIcon className="h-4 w-4 inline mr-1" />
                Search Settings
              </label>
              <SearchBox
                placeholder="Search by key or description..."
                value={filters.search || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="security">Security</option>
                <option value="email">Email</option>
                <option value="payment">Payment</option>
                <option value="ui">UI/UX</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {settings.length === 0 ? (
            <div className="text-center py-12">
              <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Settings Found</h3>
              <p className="text-gray-500">
                {filters.search || filters.category
                  ? 'No settings match the selected filters.'
                  : 'No system settings are configured.'
                }
              </p>
            </div>
          ) : (
            <DataTable
              data={settings}
              columns={columns}
              loading={isLoading}
            />
          )}
        </div>

        {/* System Health Widget */}
      <SystemHealthWidget className="mb-6" />

      {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="font-medium text-gray-900">Security Settings</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Manage authentication, session, and security configurations.
            </p>
            <Button
              variant="secondary" 
              size="sm"
              onClick={() => setFilters({ category: 'security' })}
            >
              View Security Settings
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center mb-4">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Email Settings</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure SMTP, templates, and email notification settings.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ category: 'email' })}
            >
              View Email Settings
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="font-medium text-gray-900">Payment Settings</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Manage payment gateways, fees, and financial configurations.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ category: 'payment' })}
            >
              View Payment Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Setting Modal */}
      {showEditModal && selectedSetting && (
        <EditSettingModal
          isOpen={showEditModal}
          setting={selectedSetting}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export { SystemSettingsPage };
export default SystemSettingsPage;