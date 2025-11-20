import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  GraduationCap,
  Users,
  TrendingUp,
  Award,
  UserCheck,
  UserX,
  Clock,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { studentsService } from '@/services/api';

export function StudentsDashboard() {
  const navigate = useNavigate();

  // Fetch student statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['students', 'statistics'],
    queryFn: async () => {
      const response = await studentsService.getStatistics();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage academy student enrollments, track progress, and monitor performance
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate({ to: '/students/new' })}>
          <Users className="w-4 h-4 mr-2" />
          Enroll Student
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(stats?.total_students || 0)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {stats?.enrollment_growth_percentage?.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(stats?.active_students || 0)}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {((stats?.active_students || 0) / (stats?.total_students || 1) * 100).toFixed(1)}% of total
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graduated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(stats?.graduated_students || 0)}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats?.average_completion_rate?.toFixed(1)}% completion rate
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Registration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(stats?.pending_registration || 0)}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats?.invited_students || 0} invited
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Enrollments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Enrollments</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
              <Badge variant="info">{stats?.new_enrollments_today || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
              <Badge variant="info">{stats?.new_enrollments_this_week || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              <Badge variant="success">{stats?.new_enrollments_this_month || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.average_completion_rate?.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Time to Graduate</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.average_time_to_graduate ? `${Math.round(stats.average_time_to_graduate)} days` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Dropout Rate</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {((stats?.dropout_students || 0) / (stats?.total_students || 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Courses</h3>
          </div>
          <div className="space-y-2">
            {stats?.most_popular_courses?.slice(0, 3).map((course, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {course.course_name}
                </span>
                <Badge variant="default">{course.enrollment_count}</Badge>
              </div>
            )) || <p className="text-sm text-gray-500">No data available</p>}
          </div>
        </Card>
      </div>

      {/* Top Performing Academies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Top Performing Academies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.top_performing_academies?.map((academy, index) => (
            <Card key={index} className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {academy.academy_name}
                </span>
                {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {academy.student_count}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">students enrolled</p>
            </Card>
          )) || <p className="text-sm text-gray-500">No data available</p>}
        </div>
      </Card>

      {/* Enrollment Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Enrollment Trend (Last 12 Months)
        </h3>
        <div className="h-64 flex items-end gap-2">
          {stats?.enrollments_by_month?.slice(-12).map((month, index) => {
            const maxCount = Math.max(...(stats?.enrollments_by_month?.map((m) => m.count) || [1]));
            const height = (month.count / maxCount) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {month.count}
                </div>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${month.month}: ${month.count} enrollments`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 rotate-45 origin-left mt-2">
                  {month.month}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/students' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">View All Students</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse and manage students</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/students/pending' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Pending Registrations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review pending students</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/students/graduated' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Graduated Students</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View graduation records</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
