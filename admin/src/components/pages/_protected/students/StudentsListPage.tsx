import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Mail,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { studentsService } from '@/services/api';
import type { AcademyStudent, AcademyStudentFilters, RegistrationStatus } from '@/types/api.types';
import type { TableColumn } from '@/types';

export function StudentsListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AcademyStudentFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students
  const {
    data: studentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['students', 'list', filters, page],
    queryFn: async () => {
      const response = await studentsService.searchStudents(
        { ...filters, search: searchQuery },
        { page, size: 50 }
      );
      return response.data;
    },
  });

  const handleFilterChange = (key: keyof AcademyStudentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const blob = await studentsService.exportStudents({
        format: 'csv',
        ...filters,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export students:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const config: Record<
      RegistrationStatus,
      { variant: 'success' | 'error' | 'warning' | 'info' | 'default'; icon: any }
    > = {
      active: { variant: 'success', icon: CheckCircle },
      graduated: { variant: 'success', icon: GraduationCap },
      registered: { variant: 'info', icon: UserCheck },
      invited: { variant: 'info', icon: Mail },
      pending: { variant: 'warning', icon: Clock },
      dropped_out: { variant: 'error', icon: XCircle },
      suspended: { variant: 'error', icon: XCircle },
    };

    const { variant, icon: Icon } = config[status] || { variant: 'default', icon: Clock };

    return (
      <Badge variant={variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const columns: TableColumn<AcademyStudent>[] = [
    {
      key: 'student_name',
      title: 'Student',
      render: (student) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {student.student_name || 'N/A'}
          </div>
          {student.student_email && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{student.student_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'course_name',
      title: 'Course',
      render: (student) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{student.course_name}</div>
          {student.academy_name && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{student.academy_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'maya_registration_status',
      title: 'Status',
      render: (student) => getStatusBadge(student.maya_registration_status),
    },
    {
      key: 'enrollment_date',
      title: 'Enrolled',
      render: (student) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(student.enrollment_date)}
        </div>
      ),
    },
    {
      key: 'graduation_date',
      title: 'Graduation',
      render: (student) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {student.graduation_date ? formatDate(student.graduation_date) : '—'}
        </div>
      ),
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (student) => (
        <div className="w-full">
          {student.progress_percentage !== undefined ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {student.progress_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${student.progress_percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (student) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/students/${student.id}` })}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {student.maya_registration_status === 'pending' && (
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <Mail className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse and manage academy student enrollments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" onClick={() => navigate({ to: '/students/new' })}>
            <Users className="w-4 h-4 mr-2" />
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {studentsData?.metadata?.total_items?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {studentsData?.items?.filter((s) => s.maya_registration_status === 'active').length || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Graduated</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {studentsData?.items?.filter((s) => s.maya_registration_status === 'graduated').length || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {studentsData?.items?.filter((s) => s.maya_registration_status === 'pending').length || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dropped Out</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {studentsData?.items?.filter((s) => s.maya_registration_status === 'dropped_out').length || '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search students, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              value={filters.registration_status || 'all'}
              onChange={(e) =>
                handleFilterChange(
                  'registration_status',
                  e.target.value === 'all' ? undefined : (e.target.value as RegistrationStatus)
                )
              }
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="invited">Invited</option>
              <option value="registered">Registered</option>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="dropped_out">Dropped Out</option>
              <option value="suspended">Suspended</option>
            </Select>
            <Input
              type="date"
              placeholder="Enrolled After"
              onChange={(e) => handleFilterChange('enrolled_after', e.target.value || undefined)}
            />
            <Input
              type="date"
              placeholder="Enrolled Before"
              onChange={(e) => handleFilterChange('enrolled_before', e.target.value || undefined)}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <EnhancedDataTable
            data={studentsData?.items || []}
            columns={columns}
            pagination={{
              currentPage: studentsData?.metadata?.page || 1,
              totalPages: studentsData?.metadata?.total_pages || 1,
              pageSize: studentsData?.metadata?.page_size || 50,
              totalItems: studentsData?.metadata?.total_items || 0,
              onPageChange: setPage,
            }}
            isLoading={isLoading}
            emptyMessage="No students found"
          />
        )}
      </Card>
    </div>
  );
}
