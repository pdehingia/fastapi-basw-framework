/**
 * DashboardPage component
 * Modern dashboard with real-time analytics, interactive widgets, and enhanced user experience
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Icon } from '@/components/atoms';
import { Card, CardHeader, CardBody } from '@/components/molecules';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/authStore';

interface DashboardStats {
  users: { total: number; growth: number; trend: 'up' | 'down' };
  bookings: { active: number; growth: number; trend: 'up' | 'down' };
  revenue: { monthly: number; growth: number; trend: 'up' | 'down' };
  completion: { rate: number; growth: number; trend: 'up' | 'down' };
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'user' | 'service';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
  amount?: number;
  user?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats] = useState<DashboardStats>({
    users: { total: 1234, growth: 8.2, trend: 'up' },
    bookings: { active: 567, growth: 13.8, trend: 'up' },
    revenue: { monthly: 12345, growth: 10.2, trend: 'up' },
    completion: { rate: 94.5, growth: 3.3, trend: 'up' },
  });
  
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'booking',
      title: 'New Booking Created',
      description: 'House cleaning service booked by Sarah Johnson',
      time: '2 min ago',
      status: 'success',
      amount: 150,
      user: 'Sarah Johnson',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Processed',
      description: 'Payment of $280 successfully processed',
      time: '15 min ago',
      status: 'success',
      amount: 280,
    },
    {
      id: '3',
      type: 'user',
      title: 'New User Registration',
      description: 'Mike Chen joined the platform',
      time: '32 min ago',
      status: 'info',
      user: 'Mike Chen',
    },
    {
      id: '4',
      type: 'service',
      title: 'Service Completed',
      description: 'Garden maintenance service marked as completed',
      time: '1 hour ago',
      status: 'success',
      amount: 120,
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get trend icon and color
  const getTrendDisplay = (trend: 'up' | 'down', growth: number) => {
    const isPositive = trend === 'up';
    return {
      icon: isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon',
      color: isPositive ? 'text-emerald-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-emerald-100' : 'bg-red-100',
      text: `${isPositive ? '+' : '-'}${Math.abs(growth)}%`,
    };
  };

  // Get activity icon and color
  const getActivityDisplay = (type: RecentActivity['type']) => {
    const configs = {
      booking: { icon: 'CalendarDaysIcon', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      payment: { icon: 'CreditCardIcon', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
      user: { icon: 'UserPlusIcon', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      service: { icon: 'WrenchScrewdriverIcon', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    };
    return configs[type];
  };

  // Quick actions
  const quickActions = [
    {
      id: 'users',
      label: 'User Management',
      description: 'Manage platform users',
      icon: 'UsersIcon',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate({ to: ROUTES.USERS, search: { page: 1, limit: 10 } }),
    },
    {
      id: 'bookings',
      label: 'View Bookings',
      description: 'Manage service bookings',
      icon: 'CalendarDaysIcon',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => navigate({ to: ROUTES.BOOKINGS, search: { page: 1, limit: 10 } }),
    },
    {
      id: 'payments',
      label: 'Process Payments',
      description: 'Handle transactions',
      icon: 'CreditCardIcon',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('Navigate to payments'),
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      description: 'Configure system',
      icon: 'CogIcon',
      color: 'bg-slate-500 hover:bg-slate-600',
      onClick: () => navigate({ to: ROUTES.SETTINGS, search: { section: 'general' } }),
    },
  ];

  return (
    <PageTemplate
      title={`${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'Admin'}`}
      subtitle="Here's what's happening with your platform today"
      loading={isLoading}
      layout="wide"
      primaryAction={{
        id: 'refresh',
        label: 'Refresh Data',
        icon: 'ArrowPathIcon',
        onClick: () => window.location.reload(),
      }}
      headerActions={
        <div className="flex items-center space-x-2">
          <Icon name="BellIcon" size="sm" className="text-slate-500" />
          <Button variant="ghost" size="sm">
            <span className="hidden sm:inline">Notifications</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="overflow-hidden">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="caption" className="text-slate-500 font-medium uppercase tracking-wide">
                    Total Users
                  </Text>
                  <Heading as="h3" size="xl" className="text-slate-900 mt-2">
                    {stats.users.total.toLocaleString()}
                  </Heading>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Icon name="UsersIcon" size="md" className="text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendDisplay(stats.users.trend, stats.users.growth).bgColor}`}>
                  <Icon 
                    name={getTrendDisplay(stats.users.trend, stats.users.growth).icon as any} 
                    size="xs" 
                    className={getTrendDisplay(stats.users.trend, stats.users.growth).color} 
                  />
                  <Text variant="caption" className={`font-medium ${getTrendDisplay(stats.users.trend, stats.users.growth).color}`}>
                    {getTrendDisplay(stats.users.trend, stats.users.growth).text}
                  </Text>
                </div>
                <Text variant="caption" className="text-slate-500 ml-2">
                  from last month
                </Text>
              </div>
            </CardBody>
          </Card>

          {/* Active Bookings */}
          <Card className="overflow-hidden">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="caption" className="text-slate-500 font-medium uppercase tracking-wide">
                    Active Bookings
                  </Text>
                  <Heading as="h3" size="xl" className="text-slate-900 mt-2">
                    {stats.bookings.active.toLocaleString()}
                  </Heading>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Icon name="CalendarDaysIcon" size="md" className="text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendDisplay(stats.bookings.trend, stats.bookings.growth).bgColor}`}>
                  <Icon 
                    name={getTrendDisplay(stats.bookings.trend, stats.bookings.growth).icon as any} 
                    size="xs" 
                    className={getTrendDisplay(stats.bookings.trend, stats.bookings.growth).color} 
                  />
                  <Text variant="caption" className={`font-medium ${getTrendDisplay(stats.bookings.trend, stats.bookings.growth).color}`}>
                    {getTrendDisplay(stats.bookings.trend, stats.bookings.growth).text}
                  </Text>
                </div>
                <Text variant="caption" className="text-slate-500 ml-2">
                  from last month
                </Text>
              </div>
            </CardBody>
          </Card>

          {/* Monthly Revenue */}
          <Card className="overflow-hidden">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="caption" className="text-slate-500 font-medium uppercase tracking-wide">
                    Monthly Revenue
                  </Text>
                  <Heading as="h3" size="xl" className="text-slate-900 mt-2">
                    {formatCurrency(stats.revenue.monthly)}
                  </Heading>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Icon name="CurrencyDollarIcon" size="md" className="text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendDisplay(stats.revenue.trend, stats.revenue.growth).bgColor}`}>
                  <Icon 
                    name={getTrendDisplay(stats.revenue.trend, stats.revenue.growth).icon as any} 
                    size="xs" 
                    className={getTrendDisplay(stats.revenue.trend, stats.revenue.growth).color} 
                  />
                  <Text variant="caption" className={`font-medium ${getTrendDisplay(stats.revenue.trend, stats.revenue.growth).color}`}>
                    {getTrendDisplay(stats.revenue.trend, stats.revenue.growth).text}
                  </Text>
                </div>
                <Text variant="caption" className="text-slate-500 ml-2">
                  from last month
                </Text>
              </div>
            </CardBody>
          </Card>

          {/* Completion Rate */}
          <Card className="overflow-hidden">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="caption" className="text-slate-500 font-medium uppercase tracking-wide">
                    Completion Rate
                  </Text>
                  <Heading as="h3" size="xl" className="text-slate-900 mt-2">
                    {stats.completion.rate}%
                  </Heading>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Icon name="ChartBarIcon" size="md" className="text-amber-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendDisplay(stats.completion.trend, stats.completion.growth).bgColor}`}>
                  <Icon 
                    name={getTrendDisplay(stats.completion.trend, stats.completion.growth).icon as any} 
                    size="xs" 
                    className={getTrendDisplay(stats.completion.trend, stats.completion.growth).color} 
                  />
                  <Text variant="caption" className={`font-medium ${getTrendDisplay(stats.completion.trend, stats.completion.growth).color}`}>
                    {getTrendDisplay(stats.completion.trend, stats.completion.growth).text}
                  </Text>
                </div>
                <Text variant="caption" className="text-slate-500 ml-2">
                  from last month
                </Text>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <Heading as="h2" size="lg" className="text-slate-900">
                    Recent Activity
                  </Heading>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100">
                  {recentActivity.map((activity) => {
                    const display = getActivityDisplay(activity.type);
                    return (
                      <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${display.bgColor} flex-shrink-0`}>
                            <Icon name={display.icon as any} size="sm" className={display.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <Text variant="body" className="font-medium text-slate-900">
                                {activity.title}
                              </Text>
                              <Text variant="caption" className="text-slate-500 flex-shrink-0 ml-4">
                                {activity.time}
                              </Text>
                            </div>
                            <Text color="muted" className="mt-1">
                              {activity.description}
                            </Text>
                            <div className="flex items-center justify-between mt-2">
                              {activity.user && (
                                <Text variant="caption" className="text-slate-600">
                                  User: {activity.user}
                                </Text>
                              )}
                              {activity.amount && (
                                <Text variant="caption" className="font-medium text-slate-900">
                                  {formatCurrency(activity.amount)}
                                </Text>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader className="border-b border-slate-200 pb-4">
                <Heading as="h2" size="lg" className="text-slate-900">
                  Quick Actions
                </Heading>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      className="w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 text-left group hover:scale-105"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg text-white transition-colors ${action.color}`}>
                          <Icon name={action.icon as any} size="sm" />
                        </div>
                        <div className="flex-1">
                          <Text variant="body" className="font-medium text-slate-900 group-hover:text-slate-800">
                            {action.label}
                          </Text>
                          <Text variant="caption" className="text-slate-500 mt-1">
                            {action.description}
                          </Text>
                        </div>
                        <Icon name="ChevronRightIcon" size="sm" className="text-slate-400 group-hover:text-slate-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader className="border-b border-slate-200 pb-4">
            <Heading as="h2" size="lg" className="text-slate-900">
              System Status
            </Heading>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <Text variant="body" className="font-medium text-slate-900">API Services</Text>
                  <Text variant="caption" className="text-emerald-600">All systems operational</Text>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <Text variant="body" className="font-medium text-slate-900">Database</Text>
                  <Text variant="caption" className="text-emerald-600">Response time: 45ms</Text>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <Text variant="body" className="font-medium text-slate-900">Cache System</Text>
                  <Text variant="caption" className="text-amber-600">High memory usage (85%)</Text>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default DashboardPage;