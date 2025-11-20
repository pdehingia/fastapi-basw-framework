/**
 * System Configuration Page
 * Manage system configuration, feature flags, notifications, and OTP settings
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CogIcon,
  FlagIcon,
  BellIcon,
  KeyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge, Input, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { systemConfigService } from '@/services/api/systemConfig';
import { toast } from '@/services/toast';
import type { FeatureFlag, SystemNotification } from '@/services/api/systemConfig';

const SystemConfigurationPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'flags' | 'notifications' | 'otp'>('flags');

  // Fetch feature flags
  const { data: flagsData, isLoading: flagsLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => systemConfigService.getFeatureFlags(),
    enabled: activeTab === 'flags',
  });

  // Fetch system notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: () => systemConfigService.getSystemNotifications(),
    enabled: activeTab === 'notifications',
  });

  // Fetch OTP settings
  const { data: otpSettingsData, isLoading: otpSettingsLoading } = useQuery({
    queryKey: ['otp-settings'],
    queryFn: () => systemConfigService.getOTPSettings(),
    enabled: activeTab === 'otp',
  });

  // Fetch OTP stats
  const { data: otpStatsData, isLoading: otpStatsLoading } = useQuery({
    queryKey: ['otp-stats'],
    queryFn: () => systemConfigService.getOTPStats(),
    enabled: activeTab === 'otp',
  });

  // Mutations
  const toggleFlagMutation = useMutation({
    mutationFn: (id: string) => systemConfigService.toggleFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag toggled successfully');
    },
    onError: () => toast.error('Failed to toggle feature flag'),
  });

  const deleteFlagMutation = useMutation({
    mutationFn: (id: string) => systemConfigService.deleteFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag deleted successfully');
    },
    onError: () => toast.error('Failed to delete feature flag'),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => systemConfigService.deleteSystemNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: () => toast.error('Failed to delete notification'),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: (id: string) => systemConfigService.sendSystemNotification(id),
    onSuccess: () => {
      toast.success('Notification sent successfully');
    },
    onError: () => toast.error('Failed to send notification'),
  });

  const updateOTPMutation = useMutation({
    mutationFn: (data: any) => systemConfigService.updateOTPSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otp-settings'] });
      toast.success('OTP settings updated successfully');
    },
    onError: () => toast.error('Failed to update OTP settings'),
  });

  const flags = flagsData?.data || [];
  const notifications = notificationsData?.data || [];
  const otpSettings = otpSettingsData?.data;
  const otpStats = otpStatsData?.data;

  // Feature Flags Columns
  const flagColumns = [
    {
      key: 'name',
      header: 'Feature',
      render: (_: any, flag: FeatureFlag) => (
        <div>
          <div className="font-medium">{flag.name}</div>
          <div className="text-sm text-gray-500">{flag.key}</div>
          {flag.description && (
            <div className="text-xs text-gray-400 mt-1">{flag.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, flag: FeatureFlag) => (
        <Badge variant={flag.is_enabled ? 'success' : 'default'} size="sm">
          {flag.is_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'rollout',
      header: 'Rollout',
      render: (_: any, flag: FeatureFlag) => (
        <div>
          {flag.rollout_percentage !== undefined ? (
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${flag.rollout_percentage}%` }}
                ></div>
              </div>
              <span className="text-sm">{flag.rollout_percentage}%</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">All users</span>
          )}
        </div>
      ),
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (_: any, flag: FeatureFlag) => (
        <div className="text-sm text-gray-500">
          {new Date(flag.updated_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, flag: FeatureFlag) => (
        <div className="flex space-x-1">
          <Button
            variant={flag.is_enabled ? 'warning' : 'success'}
            size="sm"
            onClick={() => toggleFlagMutation.mutate(flag.id)}
            title={flag.is_enabled ? 'Disable' : 'Enable'}
          >
            <ArrowPathIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.info('Edit feature coming soon')}
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm(`Delete feature flag "${flag.name}"?`)) {
                deleteFlagMutation.mutate(flag.id);
              }
            }}
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // System Notifications Columns
  const notificationColumns = [
    {
      key: 'notification',
      header: 'Notification',
      render: (_: any, notification: SystemNotification) => (
        <div>
          <div className="font-medium">{notification.title}</div>
          <div className="text-sm text-gray-500 mt-1">{notification.message}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (_: any, notification: SystemNotification) => (
        <Badge
          variant={
            notification.type === 'error'
              ? 'error'
              : notification.type === 'warning'
              ? 'warning'
              : notification.type === 'success'
              ? 'success'
              : 'info'
          }
          size="sm"
        >
          {notification.type}
        </Badge>
      ),
    },
    {
      key: 'audience',
      header: 'Audience',
      render: (_: any, notification: SystemNotification) => (
        <div className="text-sm capitalize">{notification.target_audience}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, notification: SystemNotification) => (
        <Badge variant={notification.is_active ? 'success' : 'default'} size="sm">
          {notification.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'dates',
      header: 'Schedule',
      render: (_: any, notification: SystemNotification) => (
        <div className="text-sm">
          {notification.start_date && (
            <div>Start: {new Date(notification.start_date).toLocaleDateString()}</div>
          )}
          {notification.end_date && (
            <div>End: {new Date(notification.end_date).toLocaleDateString()}</div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, notification: SystemNotification) => (
        <div className="flex space-x-1">
          <Button
            variant="primary"
            size="sm"
            onClick={() => sendNotificationMutation.mutate(notification.id)}
            title="Send Now"
          >
            Send
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm(`Delete notification "${notification.title}"?`)) {
                deleteNotificationMutation.mutate(notification.id);
              }
            }}
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate
      title="System Configuration"
      subtitle="Manage system settings, feature flags, and notifications"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Settings', path: '/settings' },
        { label: 'System Configuration', path: '/settings/system' },
      ]}
      actions={
        activeTab === 'flags' ? (
          <Button variant="primary" onClick={() => toast.info('Create feature coming soon')} icon={PlusIcon}>
            New Feature Flag
          </Button>
        ) : activeTab === 'notifications' ? (
          <Button variant="primary" onClick={() => toast.info('Create notification coming soon')} icon={PlusIcon}>
            New Notification
          </Button>
        ) : null
      }
    >
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'flags'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('flags')}
        >
          <FlagIcon className="h-5 w-5" />
          <span>Feature Flags</span>
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'notifications'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          <BellIcon className="h-5 w-5" />
          <span>System Notifications</span>
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'otp'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('otp')}
        >
          <KeyIcon className="h-5 w-5" />
          <span>OTP Settings</span>
        </button>
      </div>

      {/* Feature Flags Tab */}
      {activeTab === 'flags' && (
        <Card>
          <CardHeader>
            <Heading level={3}>Feature Flags</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={flags}
              columns={flagColumns}
              loading={flagsLoading}
              emptyMessage="No feature flags configured"
            />
          </CardBody>
        </Card>
      )}

      {/* System Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <Heading level={3}>System Notifications</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={notifications}
              columns={notificationColumns}
              loading={notificationsLoading}
              emptyMessage="No system notifications configured"
            />
          </CardBody>
        </Card>
      )}

      {/* OTP Settings Tab */}
      {activeTab === 'otp' && (
        <>
          {/* OTP Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardBody>
                <Text className="text-sm text-gray-500">Total OTPs Sent</Text>
                <Heading level={3} className="mt-1">
                  {otpStatsLoading ? '...' : otpStats?.total_sent?.toLocaleString() || '0'}
                </Heading>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text className="text-sm text-gray-500">Total Verified</Text>
                <Heading level={3} className="mt-1">
                  {otpStatsLoading ? '...' : otpStats?.total_verified?.toLocaleString() || '0'}
                </Heading>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text className="text-sm text-gray-500">Verification Rate</Text>
                <Heading level={3} className="mt-1">
                  {otpStatsLoading ? '...' : `${((otpStats?.verification_rate || 0) * 100).toFixed(1)}%`}
                </Heading>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text className="text-sm text-gray-500">Failed Attempts</Text>
                <Heading level={3} className="mt-1">
                  {otpStatsLoading ? '...' : otpStats?.failed_attempts?.toLocaleString() || '0'}
                </Heading>
              </CardBody>
            </Card>
          </div>

          {/* OTP Configuration */}
          <Card>
            <CardHeader>
              <Heading level={3}>OTP Configuration</Heading>
            </CardHeader>
            <CardBody>
              {otpSettingsLoading ? (
                <div className="text-center py-8">Loading settings...</div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateOTPMutation.mutate({
                      enabled: formData.get('enabled') === 'on',
                      expiry_minutes: parseInt(formData.get('expiry_minutes') as string),
                      max_attempts: parseInt(formData.get('max_attempts') as string),
                      rate_limit_per_hour: parseInt(formData.get('rate_limit') as string),
                      email_enabled: formData.get('email_enabled') === 'on',
                      sms_enabled: formData.get('sms_enabled') === 'on',
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry (Minutes)</label>
                      <Input
                        type="number"
                        name="expiry_minutes"
                        defaultValue={otpSettings?.expiry_minutes || 5}
                        min="1"
                        max="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Attempts</label>
                      <Input
                        type="number"
                        name="max_attempts"
                        defaultValue={otpSettings?.max_attempts || 3}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Rate Limit (per hour)</label>
                      <Input
                        type="number"
                        name="rate_limit"
                        defaultValue={otpSettings?.rate_limit_per_hour || 10}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SMS Provider</label>
                      <Input
                        type="text"
                        name="sms_provider"
                        defaultValue={otpSettings?.sms_provider || 'twilio'}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 pt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="enabled"
                        defaultChecked={otpSettings?.enabled}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">OTP Enabled</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="email_enabled"
                        defaultChecked={otpSettings?.email_enabled}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Email OTP</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="sms_enabled"
                        defaultChecked={otpSettings?.sms_enabled}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">SMS OTP</span>
                    </label>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary">
                      Save Settings
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </PageTemplate>
  );
};

export default SystemConfigurationPage;
