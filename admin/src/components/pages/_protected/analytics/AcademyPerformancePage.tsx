/**
 * Academy Performance Page
 * Track and analyze academy performance, courses, and student metrics
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  StarIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { academyPerformanceService } from '@/services/api/academy';
import { toast } from '@/services/toast';

const AcademyPerformancePage = () => {
  // State
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [sortBy, setSortBy] = useState<'students' | 'completion_rate' | 'revenue' | 'rating'>('students');

  // Fetch overall performance
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['academy-performance', period],
    queryFn: () => academyPerformanceService.getPerformance({ period }),
  });

  // Fetch top performers
  const { data: topPerformersData, isLoading: topPerformersLoading } = useQuery({
    queryKey: ['academy-top-performers', sortBy],
    queryFn: () => academyPerformanceService.getTopPerformers({ limit: 10, sort_by: sortBy }),
  });

  const performance = performanceData?.data;
  const topPerformers = topPerformersData?.data || [];

  // Handle export
  const handleExport = async () => {
    try {
      const response = await academyPerformanceService.exportPerformance({
        format: 'xlsx',
      });
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
        toast.success('Export started successfully');
      }
    } catch (error) {
      toast.error('Failed to export performance data');
    }
  };

  // Overview metrics
  const overviewMetrics = [
    {
      title: 'Total Academies',
      value: performance?.overview?.total_academies?.toLocaleString() || '0',
      icon: AcademicCapIcon,
      color: 'blue',
    },
    {
      title: 'Total Students',
      value: performance?.overview?.total_students?.toLocaleString() || '0',
      icon: UserGroupIcon,
      color: 'green',
    },
    {
      title: 'Total Courses',
      value: performance?.overview?.total_courses?.toLocaleString() || '0',
      icon: BookOpenIcon,
      color: 'purple',
    },
    {
      title: 'Completion Rate',
      value: `${((performance?.overview?.completion_rate || 0) * 100).toFixed(1)}%`,
      icon: TrophyIcon,
      color: 'orange',
    },
  ];

  // Top performers columns
  const topPerformersColumns = [
    {
      key: 'rank',
      header: '#',
      render: (_: any, item: any, index: number) => (
        <div className="font-bold text-gray-400">#{index + 1}</div>
      ),
    },
    {
      key: 'academy',
      header: 'Academy',
      render: (_: any, item: any) => (
        <div>
          <div className="font-medium">{item.academy_name}</div>
          <div className="text-xs text-gray-500">ID: {item.academy_id}</div>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      render: (_: any, item: any) => (
        <div className="font-semibold">{item.total_students.toLocaleString()}</div>
      ),
    },
    {
      key: 'completion',
      header: 'Completion Rate',
      render: (_: any, item: any) => (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${Math.min(item.completion_rate * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">
            {(item.completion_rate * 100).toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (_: any, item: any) => (
        <div className="flex items-center space-x-1">
          <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="font-semibold">{item.avg_rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (_: any, item: any) => (
        <div className="font-semibold text-green-600">
          ${item.revenue.toLocaleString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, item: any) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            // Navigate to academy detail
            toast.success('Academy details coming soon');
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Performance by category columns
  const categoryColumns = [
    {
      key: 'category',
      header: 'Category',
      render: (_: any, item: any) => (
        <div className="font-medium capitalize">{item.category}</div>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      render: (_: any, item: any) => (
        <div className="font-semibold">{item.student_count.toLocaleString()}</div>
      ),
    },
    {
      key: 'completion',
      header: 'Completion Rate',
      render: (_: any, item: any) => (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(item.completion_rate * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">
            {(item.completion_rate * 100).toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Avg Rating',
      render: (_: any, item: any) => (
        <div className="flex items-center space-x-1">
          <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="font-semibold">{item.avg_rating.toFixed(1)}</span>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Academy Performance"
      subtitle="Track academy performance, courses, and student progress"
      breadcrumbs={[
        { id: '1', label: 'Dashboard', href: '/dashboard' },
        { id: '2', label: 'Analytics', href: '/analytics' },
        { id: '3', label: 'Academy Performance', href: '/analytics/academy', current: true },
      ]}
      actions={
        <div className="flex gap-2">
          <Select 
            value={period} 
            onChange={(value) => setPeriod(value as any)}
            options={[
              { value: 'day', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
            ]}
          />
          <Button variant="secondary" onClick={handleExport}>
            Export
          </Button>
        </div>
      }
    >
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {overviewMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-sm text-gray-500">{metric.title}</Text>
                    <Heading size="lg" className="mt-1">
                      {performanceLoading ? '...' : metric.value}
                    </Heading>
                  </div>
                  <div className={`p-3 bg-${metric.color}-100 dark:bg-${metric.color}-900/20 rounded-lg`}>
                    <Icon className={`h-8 w-8 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Overall Rating Card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center justify-center space-x-4 py-4">
            <div className="text-center">
              <Text className="text-sm text-gray-500 mb-2">Average Rating Across All Academies</Text>
              <div className="flex items-center justify-center space-x-2">
                <StarIcon className="h-12 w-12 text-yellow-500 fill-current" />
                <Heading size="4xl" className="text-5xl">
                  {performanceLoading ? '...' : (performance?.overview?.avg_rating || 0).toFixed(1)}
                </Heading>
                <Text className="text-2xl text-gray-400">/ 5.0</Text>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Top Performers */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading size="lg">Top Performing Academies</Heading>
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              className="w-48"
              options={[
                { value: 'students', label: 'By Students' },
                { value: 'completion_rate', label: 'By Completion' },
                { value: 'revenue', label: 'By Revenue' },
                { value: 'rating', label: 'By Rating' },
              ]}
            />
          </div>
        </CardHeader>
        <CardBody>
          <Table
            data={topPerformers}
            columns={topPerformersColumns}
            loading={topPerformersLoading}
            emptyMessage="No performance data available"
          />
        </CardBody>
      </Card>

      {/* Performance by Category */}
      {performance?.performance_by_category && performance.performance_by_category.length > 0 && (
        <Card>
          <CardHeader>
            <Heading size="lg">Performance by Category</Heading>
          </CardHeader>
          <CardBody>
            <Table
              data={performance.performance_by_category}
              columns={categoryColumns}
              loading={performanceLoading}
              emptyMessage="No category data available"
            />
          </CardBody>
        </Card>
      )}
    </PageTemplate>
  );
};

export default AcademyPerformancePage;
