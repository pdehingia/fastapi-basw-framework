import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Store,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { businessContentService } from '@/services/api';
import type { Business, BusinessFilters } from '@/types/api.types';

export function SalonsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<BusinessFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch salons
  const { data: salonsData, isLoading, refetch } = useQuery({
    queryKey: ['salons', 'list', filters, page],
    queryFn: async () => {
      const response = await businessContentService.getSalons(
        { ...filters, search: searchQuery },
        { page, size: 50 }
      );
      return response.data;
    },
  });

  // Toggle salon status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ salonId, isActive }: { salonId: string; isActive: boolean }) => {
      return businessContentService.updateSalonStatus(salonId, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salons'] });
    },
  });

  // Toggle verification
  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ salonId, isVerified }: { salonId: string; isVerified: boolean }) => {
      return businessContentService.updateSalonStatus(salonId, { is_verified: isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salons'] });
    },
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleFilterChange = (key: keyof BusinessFilters, value: any) => {
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
    console.log('Export salons with filters:', filters);
  };

  const getStatusBadge = (salon: Business) => {
    if (!salon.is_active) {
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

  const getVerificationBadge = (salon: Business) => {
    if (salon.is_verified) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Pending
      </Badge>
    );
  };

  const columns = [
    {
      key: 'salon_name',
      label: 'Salon Name',
      render: (salon: Business) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{salon.salon_name}</div>
          {salon.salon_slug && (
            <div className="text-sm text-gray-500 dark:text-gray-400">@{salon.salon_slug}</div>
          )}
        </div>
      ),
    },
    {
      key: 'commission_rate',
      label: 'Commission',
      render: (salon: Business) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {salon.commission_rate ? `${salon.commission_rate}%` : 'N/A'}
        </div>
      ),
    },
    {
      key: 'gst_number',
      label: 'GST Number',
      render: (salon: Business) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {salon.gst_number || 'N/A'}
        </div>
      ),
    },
    {
      key: 'is_verified',
      label: 'Verification',
      render: (salon: Business) => getVerificationBadge(salon),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (salon: Business) => getStatusBadge(salon),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (salon: Business) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(salon.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (salon: Business) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/content/salons/${salon.id}` })}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              toggleStatusMutation.mutate({ salonId: salon.id, isActive: !salon.is_active })
            }
            disabled={toggleStatusMutation.isPending}
          >
            {salon.is_active ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </Button>
          {!salon.is_verified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toggleVerificationMutation.mutate({ salonId: salon.id, isVerified: true })
              }
              disabled={toggleVerificationMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </Button>
          )}
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

  const salons = salonsData?.items || [];
  const metadata = salonsData?.metadata;

  // Calculate summary statistics
  const totalSalons = metadata?.total || 0;
  const activeSalons = salons.filter((s) => s.is_active).length;
  const verifiedSalons = salons.filter((s) => s.is_verified).length;
  const pendingSalons = salons.filter((s) => !s.is_verified).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-8 h-8 text-blue-500" />
            Salons
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage salon listings and verifications
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Salons</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalSalons}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeSalons}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{verifiedSalons}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingSalons}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search salons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
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
            value={filters.is_verified?.toString() || ''}
            onChange={(e) =>
              handleFilterChange('is_verified', e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-[150px]"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Pending</option>
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

      {/* Salons Table */}
      <Card>
        <EnhancedDataTable
          data={salons}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No salons found"
        />
        {metadata && metadata.total > metadata.size && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(metadata.page - 1) * metadata.size + 1} to{' '}
              {Math.min(metadata.page * metadata.size, metadata.total)} of {metadata.total} salons
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
