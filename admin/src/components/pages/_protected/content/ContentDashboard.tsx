import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Store,
  GraduationCap,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  XCircle,
  Users,
  Award,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { businessContentService } from '@/services/api';

export function ContentDashboard() {
  const navigate = useNavigate();

  // Fetch business statistics
  const { data: businessStats, isLoading: loadingBusiness } = useQuery({
    queryKey: ['business', 'statistics'],
    queryFn: async () => {
      const response = await businessContentService.getBusinessStatistics();
      return response.data;
    },
  });

  // Fetch course statistics
  const { data: courseStats, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses', 'statistics'],
    queryFn: async () => {
      const response = await businessContentService.getCourseStatistics();
      return response.data;
    },
  });

  if (loadingBusiness || loadingCourses) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage salons, academies, courses, and services
          </p>
        </div>
      </div>

      {/* Business Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-500" />
          Business Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Salons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(businessStats?.total_salons || 0)}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {businessStats?.active_salons || 0} active
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Salons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(businessStats?.verified_salons || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {businessStats?.total_salons
                      ? ((businessStats.verified_salons / businessStats.total_salons) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Academies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(businessStats?.total_academies || 0)}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {businessStats?.active_academies || 0} active
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(businessStats?.total_services || 0)}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {businessStats?.active_services || 0} active
                </div>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Course Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-green-500" />
          Course Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(courseStats?.total_courses || 0)}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {courseStats?.active_courses || 0} active
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(courseStats?.featured_courses || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-yellow-600 dark:text-yellow-400">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Featured</span>
                </div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Academy Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(courseStats?.total_academy_courses || 0)}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Assigned to academies
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatNumber(
                    (businessStats?.new_salons_this_month || 0) +
                      (businessStats?.new_academies_this_month || 0)
                  )}
                </p>
                <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Growth</span>
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Courses by Category */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Courses by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(courseStats?.courses_by_category || {}).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {category}
              </span>
              <Badge variant="info">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Courses by Level */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Courses by Level
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(courseStats?.courses_by_level || {}).map(([level, count]) => (
            <div key={level} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {level}
              </span>
              <Badge variant="default">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/content/salons' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Manage Salons</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage salons</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/content/academies' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Manage Academies</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage academies</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate({ to: '/content/courses' })}
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Manage Courses</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage courses</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
