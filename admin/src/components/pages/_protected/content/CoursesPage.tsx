import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Award,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { businessContentService } from '@/services/api';
import type { Course, CourseFilters } from '@/types/api.types';

export function CoursesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CourseFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch courses
  const { data: coursesData, isLoading, refetch } = useQuery({
    queryKey: ['courses', 'list', filters, page],
    queryFn: async () => {
      const response = await businessContentService.getCourses(
        { ...filters, search: searchQuery },
        { page, size: 50 }
      );
      return response.data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['courses', 'categories'],
    queryFn: async () => {
      const response = await businessContentService.getCourseCategories();
      return response.data;
    },
  });

  // Fetch levels
  const { data: levels } = useQuery({
    queryKey: ['courses', 'levels'],
    queryFn: async () => {
      const response = await businessContentService.getCourseLevels();
      return response.data;
    },
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log('Export courses with filters:', filters);
  };

  const getStatusBadge = (course: Course) => {
    if (!course.is_active) {
      return (
        <Badge variant="error" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Active
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelColors: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
      beginner: 'info',
      intermediate: 'warning',
      advanced: 'error',
    };
    return (
      <Badge variant={levelColors[level.toLowerCase()] || 'default'}>
        {level}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'course_name',
      label: 'Course',
      render: (course: Course) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {course.course_name}
            {course.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{course.course_code}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (course: Course) => (
        <Badge variant="info" className="capitalize">
          {course.category}
        </Badge>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      render: (course: Course) => getLevelBadge(course.level),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (course: Course) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {course.duration_weeks ? `${course.duration_weeks} weeks` : 'N/A'}
          {course.total_hours && (
            <div className="text-xs text-gray-500">({course.total_hours} hours)</div>
          )}
        </div>
      ),
    },
    {
      key: 'certificate',
      label: 'Certificate',
      render: (course: Course) => (
        <div className="text-sm">
          {course.certificate_provided ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Yes
            </Badge>
          ) : (
            <Badge variant="default">No</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'suggested_price',
      label: 'Price',
      render: (course: Course) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {course.suggested_price ? `₹${course.suggested_price.toLocaleString()}` : 'N/A'}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (course: Course) => getStatusBadge(course),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/content/courses/${course.id}` })}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const courses = coursesData?.items || [];
  const metadata = coursesData?.metadata;

  // Calculate summary statistics
  const totalCourses = metadata?.total || 0;
  const activeCourses = courses.filter((c) => c.is_active).length;
  const featuredCourses = courses.filter((c) => c.is_featured).length;
  const certificateCourses = courses.filter((c) => c.certificate_provided).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-green-500" />
            Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage course catalog and assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCourses}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCourses}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{featuredCourses}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Certificate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{certificateCourses}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="w-[150px]"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </Select>
          <Select
            value={filters.level || ''}
            onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
            className="w-[150px]"
          >
            <option value="">All Levels</option>
            {levels?.map((level) => (
              <option key={level} value={level} className="capitalize">
                {level}
              </option>
            ))}
          </Select>
          <Select
            value={filters.is_active?.toString() || ''}
            onChange={(e) =>
              handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-[150px]"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
          <Select
            value={filters.is_featured?.toString() || ''}
            onChange={(e) =>
              handleFilterChange('is_featured', e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-[150px]"
          >
            <option value="">All Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </Select>
          <Button variant="outline" onClick={handleClearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Courses Table */}
      <Card>
        <EnhancedDataTable
          data={courses}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No courses found"
        />
        {metadata && metadata.total > metadata.size && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(metadata.page - 1) * metadata.size + 1} to{' '}
              {Math.min(metadata.page * metadata.size, metadata.total)} of {metadata.total} courses
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= metadata.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
