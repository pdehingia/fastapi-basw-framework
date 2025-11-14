/**
 * DashboardPage component
 * Main dashboard page after login
 */

import React from 'react';
import { useLogout } from '@/hooks/auth/useAuth';
import { Button, Heading, Text, Badge } from '@/components/atoms';
import { Card, CardHeader, CardBody } from '@/components/molecules';

const DashboardPage: React.FC = () => {
  const { logout, isLoading } = useLogout();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Heading as="h1" size="3xl" className="mb-2">Dashboard</Heading>
              <Text color="muted">Welcome to Maya Admin Panel</Text>
            </div>
            <Button
              variant="secondary"
              onClick={logout}
              isLoading={isLoading}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Heading as="h3" size="lg">Users</Heading>
                <Badge variant="primary">Active</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <Text as="p" className="text-3xl font-bold text-blue-600 mb-2">1,234</Text>
              <Text color="muted" variant="caption">Total registered users</Text>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Heading as="h3" size="lg">Bookings</Heading>
                <Badge variant="success">Live</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <Text as="p" className="text-3xl font-bold text-green-600 mb-2">567</Text>
              <Text color="muted" variant="caption">Active bookings</Text>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Heading as="h3" size="lg">Revenue</Heading>
                <Badge variant="warning">This Month</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <Text as="p" className="text-3xl font-bold text-purple-600 mb-2">$12,345</Text>
              <Text color="muted" variant="caption">Monthly revenue</Text>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Heading as="h2" size="xl" className="mb-4">Quick Actions</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="p-4 h-auto flex-col">
              <Text as="span" className="text-lg mb-1">👥</Text>
              <Text as="span">Manage Users</Text>
            </Button>
            <Button className="p-4 h-auto flex-col" variant="secondary">
              <Text as="span" className="text-lg mb-1">📅</Text>
              <Text as="span">View Bookings</Text>
            </Button>
            <Button className="p-4 h-auto flex-col" variant="secondary">
              <Text as="span" className="text-lg mb-1">💳</Text>
              <Text as="span">Process Payments</Text>
            </Button>
            <Button className="p-4 h-auto flex-col" variant="secondary">
              <Text as="span" className="text-lg mb-1">⭐</Text>
              <Text as="span">Moderate Reviews</Text>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;