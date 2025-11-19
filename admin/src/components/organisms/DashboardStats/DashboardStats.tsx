/**
 * DashboardStats Organism Component
 * Statistics dashboard with data visualization and key metrics
 */

import { memo, useState, useCallback } from 'react';
import { shallowEqual } from '@/utils/performance';
import { Icon, Text, Badge, Progress } from '@/components/atoms';
import { Card } from '@/components/molecules';

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  description?: string;
}

export interface DashboardStatsProps {
  loading?: boolean;
  stats?: StatCard[];
  showCharts?: boolean;
  className?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  loading = false,
  stats = [],
  showCharts = true,
  className = '',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Default stats if none provided
  const defaultStats: StatCard[] = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: '2,847',
      change: 12.5,
      changeType: 'increase',
      icon: 'UsersIcon',
      color: 'blue',
      description: 'Active registered users',
    },
    {
      id: 'total-bookings',
      title: 'Total Bookings',
      value: '1,429',
      change: 8.2,
      changeType: 'increase',
      icon: 'CalendarDaysIcon',
      color: 'green',
      description: 'Completed bookings this month',
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: '$89,247',
      change: -3.1,
      changeType: 'decrease',
      icon: 'CurrencyDollarIcon',
      color: 'yellow',
      description: 'Total revenue this month',
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '4.8%',
      change: 15.3,
      changeType: 'increase',
      icon: 'ChartBarIcon',
      color: 'purple',
      description: 'Booking conversion rate',
    },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  // Period options
  const periodOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  // Get color classes for stats
  const getColorClasses = useCallback((color: string) => {
    const colorMap = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
      green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
      red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  }, []);

  // Get change color and icon
  const getChangeDisplay = useCallback((change: number, changeType: string) => {
    if (changeType === 'neutral' || change === 0) {
      return { color: 'text-gray-500', icon: 'MinusIcon', prefix: '' };
    }
    
    if (changeType === 'increase' || change > 0) {
      return { color: 'text-green-600', icon: 'ArrowUpIcon', prefix: '+' };
    }
    
    return { color: 'text-red-600', icon: 'ArrowDownIcon', prefix: '-' };
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Period Selector */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">Key performance metrics and trends</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat) => {
          const colors = getColorClasses(stat.color);
          const changeDisplay = getChangeDisplay(stat.change, stat.changeType);

          return (
            <Card key={stat.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                  <Icon name={stat.icon as any} size="md" className={colors.icon} />
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <Text variant="small" color="muted" className="mb-1">
                    {stat.title}
                  </Text>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  
                  {/* Change indicator */}
                  <div className={`flex items-center space-x-1 text-sm ${changeDisplay.color}`}>
                    <Icon name={changeDisplay.icon as any} size="xs" />
                    <span>
                      {changeDisplay.prefix}{Math.abs(stat.change)}%
                    </span>
                    <span className="text-gray-500">vs last period</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {stat.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Text variant="small" color="muted">
                    {stat.description}
                  </Text>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-600">Monthly revenue over time</p>
            </div>
            
            {/* Placeholder chart */}
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Icon name="ChartBarIcon" size="xl" className="text-gray-400 mx-auto mb-2" />
                <Text variant="small" color="muted">Chart visualization coming soon</Text>
              </div>
            </div>
          </Card>

          {/* Activity Chart */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
              <p className="text-sm text-gray-600">Daily active users and bookings</p>
            </div>
            
            {/* Activity Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text variant="small">New Users</Text>
                  <Badge variant="success" size="sm">+12%</Badge>
                </div>
                <Progress value={75} color="success" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text variant="small">Active Sessions</Text>
                  <Badge variant="primary" size="sm">+8%</Badge>
                </div>
                <Progress value={60} color="primary" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text variant="small">Bookings Completed</Text>
                  <Badge variant="warning" size="sm">-3%</Badge>
                </div>
                <Progress value={45} color="warning" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text variant="small">Customer Satisfaction</Text>
                  <Badge variant="success" size="sm">4.8/5</Badge>
                </div>
                <Progress value={96} color="success" size="sm" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Memoize for performance
const MemoizedDashboardStats = memo(DashboardStats, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedDashboardStats.displayName = 'DashboardStats';

export default MemoizedDashboardStats;