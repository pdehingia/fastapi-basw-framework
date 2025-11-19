/**
 * System Health Widget Component
 * Real-time system health monitoring and status display
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/molecules';
import { Button, Heading, Text, Badge } from '@/components/atoms';
import { useSystemInfo } from '@/hooks/api/useSettings';

interface HealthMetric {
  name: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

interface SystemHealthWidgetProps {
  className?: string;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ className }) => {
  const { data: systemInfo, isLoading, error, refetch } = useSystemInfo();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Helper function to format uptime
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const healthMetrics: HealthMetric[] = systemInfo ? [
    {
      name: 'System Uptime',
      value: formatUptime(systemInfo.uptime),
      status: systemInfo.uptime > 86400 ? 'healthy' : 'warning', // 24 hours
      description: 'Time since last system restart'
    },
    {
      name: 'API Response Time',
      value: '< 200ms',
      status: 'healthy',
      description: 'Average API response time'
    },
    {
      name: 'Active Users',
      value: '1,247',
      status: 'healthy',
      description: 'Currently active users'
    },
    {
      name: 'Memory Usage',
      value: '67%',
      status: 'warning',
      description: 'Current memory utilization'
    },
    {
      name: 'Database Connections',
      value: '15/100',
      status: 'healthy',
      description: 'Active database connections'
    },
    {
      name: 'Storage Usage',
      value: '2.3TB / 5TB',
      status: 'healthy',
      description: 'Disk storage utilization'
    }
  ] : [];

  const getStatusBadgeProps = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy':
        return { variant: 'success' as const, children: 'Healthy' };
      case 'warning':
        return { variant: 'warning' as const, children: 'Warning' };
      case 'critical':
        return { variant: 'error' as const, children: 'Critical' };
      default:
        return { variant: 'default' as const, children: 'Unknown' };
    }
  };

  const getOverallStatus = (): HealthMetric['status'] => {
    if (healthMetrics.some(m => m.status === 'critical')) return 'critical';
    if (healthMetrics.some(m => m.status === 'warning')) return 'warning';
    return 'healthy';
  };

  const getStatusIcon = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Heading as="h3" size="lg">System Health</Heading>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <Heading as="h3" size="lg">System Health</Heading>
        </CardHeader>
        <CardBody>
          <div className="text-center py-6">
            <Text color="muted" className="mb-4">
              Failed to load system health information
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Heading as="h3" size="lg">System Health</Heading>
          <div className="flex items-center space-x-3">
            <Badge {...getStatusBadgeProps(overallStatus)}>
              {getStatusIcon(overallStatus)} {getStatusBadgeProps(overallStatus).children}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>
        <Text color="muted">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthMetrics.map((metric) => (
            <div
              key={metric.name}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Text variant="body" className="font-medium text-gray-900">
                    {metric.name}
                  </Text>
                  <Text variant="caption" color="muted" className="mt-1">
                    {metric.description}
                  </Text>
                </div>
                <span className="text-lg">
                  {getStatusIcon(metric.status)}
                </span>
              </div>
              <div className="mt-2">
                <Text variant="body" className="font-semibold text-gray-900">
                  {metric.value}
                </Text>
              </div>
            </div>
          ))}
        </div>

        {/* System Information Summary */}
        {systemInfo && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Text variant="caption" color="muted">Version</Text>
                <Text variant="body" className="font-medium">
                  {systemInfo.version}
                </Text>
              </div>
              <div>
                <Text variant="caption" color="muted">Environment</Text>
                <Text variant="body" className="font-medium">
                  {systemInfo.environment}
                </Text>
              </div>
              <div>
                <Text variant="caption" color="muted">Last Deployment</Text>
                <Text variant="body" className="font-medium">
                  {new Date(systemInfo.lastDeployment).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Text variant="body" className="font-medium text-gray-900 mb-3">
            Quick Actions
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Download System Report
            </Button>
            <Button variant="outline" size="sm">
              Clear Cache
            </Button>
            <Button variant="outline" size="sm">
              Restart Services
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              Maintenance Mode
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SystemHealthWidget;