/**
 * Artist Verification Queue Component
 * Main interface for managing artist verification requests
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter, Download } from 'lucide-react';

import Table from '../../../molecules/Table';
import Button from '../../../atoms/Button';
import Badge from '../../../atoms/Badge';
import { useToast } from '../../../../hooks/ui/useToast';
import { artistVerificationService, type VerificationRequest, type VerificationFilters } from '../../../../services/api/artistVerificationService';

// Status badge mapping
const statusBadges = {
  pending: { variant: 'warning' as const, icon: Clock, label: 'Pending' },
  under_review: { variant: 'info' as const, icon: Eye, label: 'Under Review' },
  approved: { variant: 'success' as const, icon: CheckCircle, label: 'Approved' },
  rejected: { variant: 'error' as const, icon: XCircle, label: 'Rejected' },
};

// Verification type badge mapping
const verificationBadges = {
  basic: { variant: 'default' as const, label: 'Basic' },
  professional: { variant: 'primary' as const, label: 'Professional' },
  elite: { variant: 'warning' as const, label: 'Elite' },
};

interface VerificationQueueProps {
  className?: string;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({ className = '' }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState<VerificationFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Queries
  const { data: verificationData, isLoading, error } = useQuery({
    queryKey: ['verificationQueue', filters],
    queryFn: () => artistVerificationService.getVerificationQueue(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: statsData } = useQuery({
    queryKey: ['verificationStats'],
    queryFn: () => artistVerificationService.getVerificationStats(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Mutations
  const makeDecisionMutation = useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: any }) =>
      artistVerificationService.makeVerificationDecision(requestId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationQueue'] });
      queryClient.invalidateQueries({ queryKey: ['verificationStats'] });
      toast({
        title: 'Success',
        description: 'Verification decision made successfully',
      });
      setSelectedRequests([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to make verification decision',
        variant: 'destructive',
      });
    },
  });

  const requests = verificationData?.data || [];
  const stats = statsData?.data;

  // Filter requests by search term
  const filteredRequests = requests.filter((request: VerificationRequest) =>
    request.artist?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.artist?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle bulk actions
  const handleBulkApprove = () => {
    if (selectedRequests.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select requests to approve',
        variant: 'destructive',
      });
      return;
    }

    selectedRequests.forEach((requestId) => {
      makeDecisionMutation.mutate({
        requestId,
        decision: {
          status: 'approved',
          admin_notes: 'Bulk approved',
        },
      });
    });
  };

  const handleBulkReject = () => {
    if (selectedRequests.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select requests to reject',
        variant: 'destructive',
      });
      return;
    }

    selectedRequests.forEach((requestId) => {
      makeDecisionMutation.mutate({
        requestId,
        decision: {
          status: 'rejected',
          admin_notes: 'Bulk rejected',
        },
      });
    });
  };

  // Table configuration
  const tableConfig = {
    columns: [
      {
        key: 'select',
        header: '',
        render: (_value: any, request: VerificationRequest) => (
          <input
            type="checkbox"
            checked={selectedRequests.includes(request.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRequests([...selectedRequests, request.id]);
              } else {
                setSelectedRequests(selectedRequests.filter(id => id !== request.id));
              }
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
      },
      {
        key: 'artist',
        header: 'Artist',
        render: (_value: any, request: VerificationRequest) => (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">{request.artist?.full_name}</div>
            <div className="text-sm text-gray-500">{request.artist?.email}</div>
          </div>
        ),
      },
      {
        key: 'verification_type',
        header: 'Type',
        render: (_value: any, request: VerificationRequest) => {
          const badge = verificationBadges[request.verification_type];
          return (
            <Badge variant={badge.variant}>
              {badge.label}
            </Badge>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (_value: any, request: VerificationRequest) => {
          const statusConfig = statusBadges[request.status];
          const StatusIcon = statusConfig.icon;
          return (
            <Badge variant={statusConfig.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          );
        },
      },
      {
        key: 'submitted_at',
        header: 'Submitted',
        render: (_value: any, request: VerificationRequest) => (
          <div className="text-sm text-gray-900">
            {new Date(request.submitted_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        key: 'documents_count',
        header: 'Documents',
        render: (_value: any, request: VerificationRequest) => (
          <div className="text-sm text-gray-900">
            {request.documents?.length || 0}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_value: any, request: VerificationRequest) => (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/artist-verification/verification-queue/${request.id}`, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {request.status === 'pending' && (
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => makeDecisionMutation.mutate({
                    requestId: request.id,
                    decision: { status: 'approved', admin_notes: 'Quick approved' }
                  })}
                  disabled={makeDecisionMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => makeDecisionMutation.mutate({
                    requestId: request.id,
                    decision: { status: 'rejected', admin_notes: 'Quick rejected' }
                  })}
                  disabled={makeDecisionMutation.isPending}
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            )}
          </div>
        ),
      },
    ],
    data: filteredRequests,
    loading: isLoading,
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Verification Queue</h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['verificationQueue'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artist Verification Queue</h1>
          <p className="text-gray-600 mt-1">
            Review and manage artist verification requests
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => window.open('/artist-verification/verification-queue/stats', '_blank')}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.pending_requests || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-green-600">{stats?.total_requests || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-red-600">{stats?.approved_rate ? `${stats.approved_rate}%` : '0%'}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Review Time</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.average_review_time ? `${stats.average_review_time}h` : '0h'}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by artist name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter and Bulk Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {selectedRequests.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedRequests.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={makeDecisionMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReject}
                  disabled={makeDecisionMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Type
                </label>
                <select
                  value={filters.verification_type || ''}
                  onChange={(e) => setFilters({ ...filters, verification_type: e.target.value as any || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="elite">Elite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.date_from || ''}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
              <Button
                size="sm"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table 
          data={tableConfig.data}
          columns={tableConfig.columns}
          loading={tableConfig.loading}
          emptyMessage="No verification requests found"
        />
      </div>
    </div>
  );
};

export default VerificationQueue;
