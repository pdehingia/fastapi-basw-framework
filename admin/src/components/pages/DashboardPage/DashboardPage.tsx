/**
 * DashboardPage component
 * Main dashboard page with analytics and overview
 */

import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Heading, Text, Badge } from '@/components/atoms';
import { Card, CardHeader, CardBody } from '@/components/molecules';
import { ROUTES } from '@/config/routes';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real API calls later
  const recentBookings = [
    {
      id: 1,
      service: 'House Cleaning',
      customer: 'Sarah Johnson',
      provider: 'CleanPro LLC',
      date: '2024-01-15',
      status: 'success',
      amount: 150,
    },
    {
      id: 2,
      service: 'Plumbing Repair',
      customer: 'Mike Chen',
      provider: 'Quick Fix Solutions',
      date: '2024-01-14',
      status: 'warning',
      amount: 280,
    },
    {
      id: 3,
      service: 'Garden Maintenance',
      customer: 'Emma Wilson',
      provider: 'Green Thumb Services',
      date: '2024-01-13',
      status: 'success',
      amount: 120,
    },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Completed';
      case 'primary': return 'Confirmed';
      case 'warning': return 'In Progress';
      default: return 'Pending';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <Heading as="h1" size="2xl" className="text-gray-900">
          Welcome back, Admin
        </Heading>
        <Text color="muted" className="mt-1">
          Here's what's happening with your platform today.
        </Text>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <Text variant="caption" color="muted">Total Users</Text>
                <Heading as="h3" size="lg" className="text-blue-600">1,234</Heading>
                <Text variant="caption" className="text-green-600">+8.2% from last month</Text>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <Text variant="caption" color="muted">Active Bookings</Text>
                <Heading as="h3" size="lg" className="text-green-600">567</Heading>
                <Text variant="caption" className="text-green-600">+13.8% from last month</Text>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <Text variant="caption" color="muted">Monthly Revenue</Text>
                <Heading as="h3" size="lg" className="text-purple-600">$12,345</Heading>
                <Text variant="caption" className="text-green-600">+10.2% from last month</Text>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <Text variant="caption" color="muted">Completion Rate</Text>
                <Heading as="h3" size="lg" className="text-yellow-600">94.5%</Heading>
                <Text variant="caption" className="text-green-600">+3.3% from last month</Text>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Heading as="h2" size="lg">Recent Bookings</Heading>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate({ 
                  to: ROUTES.BOOKINGS,
                  search: { page: 1, limit: 10 }
                })}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <Text variant="body" className="font-medium text-gray-900">
                      {booking.service}
                    </Text>
                    <Text variant="caption" color="muted">
                      {booking.customer} • {booking.provider}
                    </Text>
                    <Text variant="caption" color="muted">
                      {new Date(booking.date).toLocaleDateString()}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Badge variant={booking.status as 'success' | 'primary' | 'warning'} size="sm">
                      {getStatusText(booking.status)}
                    </Badge>
                    <Text variant="caption" className="block mt-1">
                      ${booking.amount}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <Heading as="h2" size="lg">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="p-4 h-auto flex flex-col items-center justify-center space-y-2"
                variant="secondary"
                onClick={() => navigate({ 
                  to: ROUTES.USERS,
                  search: { page: 1, limit: 10 }
                })}
              >
                <span className="text-2xl">👥</span>
                <Text variant="body" className="text-center">
                  Manage Users
                </Text>
              </Button>
              <Button 
                className="p-4 h-auto flex flex-col items-center justify-center space-y-2"
                variant="secondary"
                onClick={() => navigate({ 
                  to: ROUTES.BOOKINGS,
                  search: { page: 1, limit: 10 }
                })}
              >
                <span className="text-2xl">📅</span>
                <Text variant="body" className="text-center">
                  View Bookings
                </Text>
              </Button>
              <Button 
                className="p-4 h-auto flex flex-col items-center justify-center space-y-2"
                variant="secondary"
              >
                <span className="text-2xl">💳</span>
                <Text variant="body" className="text-center">
                  Process Payments
                </Text>
              </Button>
              <Button 
                className="p-4 h-auto flex flex-col items-center justify-center space-y-2"
                variant="secondary"
                onClick={() => navigate({ 
                  to: ROUTES.SETTINGS,
                  search: { section: 'general' }
                })}
              >
                <span className="text-2xl">⚙️</span>
                <Text variant="body" className="text-center">
                  Settings
                </Text>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <Heading as="h2" size="lg">Platform Health</Heading>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              <div>
                <Text variant="body" className="font-medium">API Status</Text>
                <Text variant="caption" color="muted">All services operational</Text>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              <div>
                <Text variant="body" className="font-medium">Database</Text>
                <Text variant="caption" color="muted">Response time: 45ms</Text>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
              <div>
                <Text variant="body" className="font-medium">Cache</Text>
                <Text variant="caption" color="muted">High memory usage</Text>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardPage;