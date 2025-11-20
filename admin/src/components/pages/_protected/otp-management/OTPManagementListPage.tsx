import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Lock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  Phone,
  Unlock,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Spinner } from '../../../atoms/Spinner';
import { EnhancedDataTable } from '../../../organisms';
import { otpManagementService } from '../../../../services/api';
import type {
  OTPVerification,
  OTPVerificationFilters,
  OTPVerificationListResponse,
} from '../../../../types/api.types';

/**
 * OTP Management List Page - View and manage all OTP verifications
 */
export function OTPManagementListPage() {
  const queryClient = useQueryClient();

  // State
  const [filters, setFilters] = useState<OTPVerificationFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Query for OTP verifications
  const { data, isLoading } = useQuery<OTPVerificationListResponse>({
    queryKey: ['otp', 'list', filters, page],
    queryFn: () =>
      otpManagementService.getOTPVerifications(filters, {
        page,
        page_size: 20,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (otpId: number) => otpManagementService.deleteOTPVerification(otpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otp'] });
    },
  });

  // Unblock mutation
  const unblockMutation = useMutation({
    mutationFn: (phoneNumber: string) =>
      otpManagementService.unblockPhone({
        phone_number: phoneNumber,
        country_code: '+91',
        reason: 'Unblocked by admin',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otp'] });
    },
  });

  // Handle search
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, phone_number: searchQuery || undefined }));
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof OTPVerificationFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  // Check if OTP is expired
  const isExpired = (otp: OTPVerification) => {
    return new Date(otp.expires_at) < new Date();
  };

  // Define table columns
  const columns = [
    {
      key: 'phone_number' as keyof OTPVerification,
      label: 'Phone Number',
      sortable: true,
      render: (otp: OTPVerification) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-gray-900 dark:text-white">
            {otp.country_code} {otp.phone_number}
          </span>
        </div>
      ),
    },
    {
      key: 'purpose' as keyof OTPVerification,
      label: 'Purpose',
      sortable: true,
      render: (otp: OTPVerification) => (
        <Badge variant="info" className="capitalize">
          {otp.purpose}
        </Badge>
      ),
    },
    {
      key: 'user_type' as keyof OTPVerification,
      label: 'User Type',
      sortable: false,
      render: (otp: OTPVerification) =>
        otp.user_type ? (
          <Badge variant="default" className="capitalize">
            {otp.user_type}
          </Badge>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">N/A</span>
        ),
    },
    {
      key: 'otp_code' as keyof OTPVerification,
      label: 'OTP Code',
      sortable: false,
      render: (otp: OTPVerification) => (
        <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
          {otp.otp_code}
        </span>
      ),
    },
    {
      key: 'attempts_count' as keyof OTPVerification,
      label: 'Attempts',
      sortable: true,
      render: (otp: OTPVerification) => (
        <div className="text-center">
          <span
            className={`font-semibold ${
              otp.attempts_count >= otp.max_attempts
                ? 'text-red-600 dark:text-red-400'
                : otp.attempts_count >= otp.max_attempts / 2
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-900 dark:text-white'
            }`}
          >
            {otp.attempts_count}/{otp.max_attempts}
          </span>
        </div>
      ),
    },
    {
      key: 'is_verified' as keyof OTPVerification,
      label: 'Status',
      sortable: true,
      render: (otp: OTPVerification) => (
        <div className="flex flex-col gap-1">
          {otp.is_verified ? (
            <Badge variant="success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : isExpired(otp) ? (
            <Badge variant="default">
              <Clock className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          ) : otp.is_blocked ? (
            <Badge variant="danger">
              <Ban className="h-3 w-3 mr-1" />
              Blocked
            </Badge>
          ) : (
            <Badge variant="warning">
              <XCircle className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'created_at' as keyof OTPVerification,
      label: 'Created',
      sortable: true,
      render: (otp: OTPVerification) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">
            {new Date(otp.created_at).toLocaleDateString()}
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            {new Date(otp.created_at).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: 'expires_at' as keyof OTPVerification,
      label: 'Expires',
      sortable: true,
      render: (otp: OTPVerification) => {
        const expired = isExpired(otp);
        return (
          <div className="text-sm">
            <p className={expired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}>
              {new Date(otp.expires_at).toLocaleTimeString()}
            </p>
            {expired && (
              <Badge variant="danger" className="mt-1 text-xs">
                Expired
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions' as keyof OTPVerification,
      label: 'Actions',
      sortable: false,
      render: (otp: OTPVerification) => (
        <div className="flex items-center gap-2">
          {otp.is_blocked && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => unblockMutation.mutate(otp.phone_number)}
              disabled={unblockMutation.isPending}
              title="Unblock Number"
            >
              <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm('Are you sure you want to delete this OTP record?')) {
                deleteMutation.mutate(otp.id);
              }
            }}
            disabled={deleteMutation.isPending}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  // Summary stats
  const totalOTPs = data?.total || 0;
  const verifiedCount = data?.items.filter((o) => o.is_verified).length || 0;
  const blockedCount = data?.items.filter((o) => o.is_blocked).length || 0;
  const expiredCount = data?.items.filter((o) => isExpired(o)).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OTP Verifications</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor and manage all OTP verifications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total OTPs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOTPs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{verifiedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blocked</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{blockedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{expiredCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search by Phone */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by Phone
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Purpose Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purpose
            </label>
            <Select
              value={filters.purpose || ''}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
            >
              <option value="">All Purposes</option>
              <option value="login">Login</option>
              <option value="register">Register</option>
              <option value="password_reset">Password Reset</option>
              <option value="verification">Verification</option>
            </Select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={
                filters.is_verified === undefined ? '' : filters.is_verified ? 'true' : 'false'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_verified',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Select>
          </div>

          {/* Blocked Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blocked
            </label>
            <Select
              value={
                filters.is_blocked === undefined ? '' : filters.is_blocked ? 'true' : 'false'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_blocked',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
            >
              <option value="">All</option>
              <option value="true">Blocked Only</option>
              <option value="false">Not Blocked</option>
            </Select>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User Type
            </label>
            <Select
              value={filters.user_type || ''}
              onChange={(e) => handleFilterChange('user_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* OTP Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No OTP verifications found matching your filters
            </p>
          </div>
        ) : (
          <EnhancedDataTable
            data={data.items}
            columns={columns}
            pagination={{
              currentPage: page,
              totalPages: data.pages,
              pageSize: 20,
              totalItems: data.total,
              onPageChange: setPage,
            }}
          />
        )}
      </Card>
    </div>
  );
}
