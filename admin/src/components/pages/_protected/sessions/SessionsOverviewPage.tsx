/**
 * Sessions Overview Page
 * Provides navigation to different session types and combined statistics
 */

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  UserIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge } from '@/components/atoms';
import { Card, CardHeader, CardBody } from '@/components/molecules';
import { sessionManagementService } from '@/services/api';

const SessionsOverviewPage = () => {
  const navigate = useNavigate();

  // Fetch combined session statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['sessions-stats-overview'],
    queryFn: () => sessionManagementService.getAllSessionsStats(),
  });

  const stats = statsData?.data;

  const sessionCards = [
    {
      title: 'Admin Sessions',
      icon: UserGroupIcon,
      color: 'blue',
      path: '/sessions/admin',
      stats: stats?.admin || null,
    },
    {
      title: 'Provider Sessions',
      icon: BuildingStorefrontIcon,
      color: 'purple',
      path: '/sessions/provider',
      stats: stats?.provider || null,
    },
    {
      title: 'Customer Sessions',
      icon: UserIcon,
      color: 'green',
      path: '/sessions/customer',
      stats: stats?.customer || null,
    },
  ];

  return (
    <PageTemplate
      title="Session Management"
      subtitle="Monitor and manage user sessions across the platform"
      breadcrumbs={[
        { id: '1', label: 'Dashboard', href: '/dashboard' },
        { id: '2', label: 'Sessions', href: '/sessions', current: true },
      ]}
    >
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Total Sessions
                </Text>
                <Heading size="xl" className="mt-1">
                  {statsLoading ? '...' : stats?.total.total_sessions.toLocaleString() || '0'}
                </Heading>
              </div>
              <ComputerDesktopIcon className="h-12 w-12 text-blue-500" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Active Sessions
                </Text>
                <Heading size="xl" className="mt-1 text-green-600">
                  {statsLoading ? '...' : stats?.total.active_sessions.toLocaleString() || '0'}
                </Heading>
              </div>
              <DevicePhoneMobileIcon className="h-12 w-12 text-green-500" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Unique Users
                </Text>
                <Heading size="xl" className="mt-1">
                  {statsLoading ? '...' : stats?.total.unique_users.toLocaleString() || '0'}
                </Heading>
              </div>
              <UserIcon className="h-12 w-12 text-purple-500" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Session Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sessionCards.map((card) => {
          const Icon = card.icon;
          const cardStats = card.stats;

          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${card.color}-100 dark:bg-${card.color}-900/20 rounded-lg`}>
                      <Icon className={`h-6 w-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                    </div>
                    <Heading size="lg">{card.title}</Heading>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : cardStats ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Total:</Text>
                        <Text className="font-semibold">{cardStats.total_sessions}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Active:</Text>
                        <Badge variant="success">{cardStats.active_sessions}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Today:</Text>
                        <Text className="font-semibold">{cardStats.sessions_today}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">Unique Users:</Text>
                        <Text className="font-semibold">{cardStats.unique_users}</Text>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full mt-4"
                      onClick={() => navigate({ to: card.path })}
                    >
                      View Details
                    </Button>
                  </>
                ) : (
                  <Text className="text-gray-500">No data available</Text>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Device Distribution (if available) */}
      {stats?.admin?.top_devices && stats.admin.top_devices.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <Heading size="lg">Device Distribution</Heading>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-4">
              {stats.admin.top_devices.map((device: any) => (
                <div key={device.device_type} className="text-center">
                  <div className="flex justify-center mb-2">
                    {device.device_type === 'desktop' && <ComputerDesktopIcon className="h-8 w-8 text-gray-600" />}
                    {device.device_type === 'mobile' && <DevicePhoneMobileIcon className="h-8 w-8 text-gray-600" />}
                    {device.device_type === 'tablet' && <DeviceTabletIcon className="h-8 w-8 text-gray-600" />}
                  </div>
                  <Text className="text-sm capitalize">{device.device_type}</Text>
                  <Text className="font-semibold text-lg">{device.count}</Text>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </PageTemplate>
  );
};

export default SessionsOverviewPage;
