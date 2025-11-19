/**
 * Review Management Component
 * Main interface for managing reviews, ratings, and moderation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  StarIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  FlagIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  UserIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '@/components/atoms/Button';
import Table from '@/components/molecules/Table';
import Badge from '@/components/atoms/Badge';
import Text from '@/components/atoms/Text';
import Select from '@/components/atoms/Select';
import { reviewService, type Review, type ReviewFilters } from '@/services/api/reviewService';
import { useToast } from '@/hooks/ui/useToast';
import { formatDate, formatNumber } from '@/utils/formatters';

interface ReviewStats {
  total_reviews: number;
  pending_reviews: number;
  average_rating: number;
  flagged_reviews: number;
}

export const ReviewManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReviewFilters>({
    status: '',
    rating: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ['reviews', currentPage, pageSize, filters, searchQuery],
    queryFn: () => reviewService.getReviews({
      page: currentPage,
      limit: pageSize,
      search: searchQuery || undefined,
      ...filters,
    }),
    placeholderData: (previousData) => previousData,
  });

  // Fetch review analytics
  const {
    data: analyticsData,
  } = useQuery({
    queryKey: ['review-analytics'],
    queryFn: () => reviewService.getReviewAnalytics('monthly'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch flagged reviews count
  const {
    data: flaggedData,
  } = useQuery({
    queryKey: ['flagged-reviews-count'],
    queryFn: () => reviewService.getFlaggedReviews(1, 1),
    select: (data) => data.pagination?.total || 0,
  });

  // Moderation mutation
  const moderationMutation = useMutation({
    mutationFn: ({ reviewId, status, notes }: { reviewId: string; status: 'approved' | 'rejected'; notes?: string }) =>
      reviewService.moderateReview(reviewId, { status, admin_notes: notes }),
    onSuccess: (_, variables) => {
      toast({
        variant: 'success',
        title: 'Review Moderated',
        description: `Review has been ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-analytics'] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Moderation Failed',
        description: error.message || 'Failed to moderate review',
      });
    },
  });

  // Bulk moderation mutation
  const bulkModerationMutation = useMutation({
    mutationFn: ({ action, reviewIds, notes }: { action: string; reviewIds: string[]; notes?: string }) =>
      reviewService.bulkModerateReviews({
        review_ids: reviewIds,
        action: action as any,
        admin_notes: notes,
        notify_reviewers: true,
        notify_providers: true,
      }),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Bulk Action Complete',
        description: `${data.data.processed_count} reviews processed`,
      });
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-analytics'] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Bulk Action Failed',
        description: error.message || 'Failed to process bulk action',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Review Deleted',
        description: 'Review has been permanently removed',
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-analytics'] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete review',
      });
    },
  });

  // Calculate stats
  const stats: ReviewStats = useMemo(() => {
    const analytics = analyticsData?.data;
    const flaggedCount = flaggedData || 0;
    
    if (!analytics) {
      return {
        total_reviews: 0,
        pending_reviews: 0,
        average_rating: 0,
        flagged_reviews: flaggedCount,
      };
    }

    const pendingReviews = analytics.moderation_stats?.pending_count || 0;
    
    return {
      total_reviews: analytics.total_reviews,
      pending_reviews: pendingReviews,
      average_rating: analytics.average_rating,
      flagged_reviews: flaggedCount,
    };
  }, [analyticsData, flaggedData]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setCurrentPage(1);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle moderation
  const handleModerate = useCallback((reviewId: string, status: 'approved' | 'rejected', notes?: string) => {
    moderationMutation.mutate({ reviewId, status, notes });
  }, [moderationMutation]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    if (selectedRows.length === 0) {
      toast({
        variant: 'warning',
        title: 'No Selection',
        description: 'Please select reviews to perform bulk action',
      });
      return;
    }

    bulkModerationMutation.mutate({
      action,
      reviewIds: selectedRows,
    });
  }, [selectedRows, bulkModerationMutation, toast]);

  // Handle delete
  const handleDelete = useCallback((reviewId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      deleteMutation.mutate(reviewId);
    }
  }, [deleteMutation]);

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'reviewer',
      header: 'Reviewer',
      sortable: false,
      render: (review: Review) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {review.user?.avatar_url ? (
              <img src={review.user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div>
            <Text variant="body" className="font-medium">{review.user?.full_name || 'Anonymous'}</Text>
          </div>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      sortable: false,
      render: (review: Review) => (
        <div className="flex items-center space-x-3">
          <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
          <div>
            <Text variant="body" className="font-medium">{review.service?.title || 'Unknown Service'}</Text>
            <Text variant="caption" className="text-slate-500">{review.provider?.business_name || 'Unknown Provider'}</Text>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIconSolid
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating ? 'text-yellow-400' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{review.rating}</span>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Review',
      sortable: false,
      render: (review: Review) => (
        <div className="max-w-xs">
          {review.title && (
            <Text variant="body" className="font-medium mb-1">{review.title}</Text>
          )}
          <Text variant="caption" className="text-slate-600 line-clamp-2">
            {review.content || 'No content provided'}
          </Text>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (review: Review) => {
        const statusConfig = {
          pending: { variant: 'warning' as const, label: 'Pending' },
          approved: { variant: 'success' as const, label: 'Approved' },
          rejected: { variant: 'error' as const, label: 'Rejected' },
          flagged: { variant: 'error' as const, label: 'Flagged' },
        };
        
        const config = statusConfig[review.status] || statusConfig.pending;
        
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'engagement',
      header: 'Engagement',
      sortable: false,
      render: (review: Review) => (
        <div className="flex items-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <HeartIcon className="w-4 h-4" />
            <span>{formatNumber(review.helpful_count || 0)}</span>
          </div>
          {review.reported_count > 0 && (
            <div className="flex items-center space-x-1 text-red-500">
              <FlagIcon className="w-4 h-4" />
              <span>{formatNumber(review.reported_count)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (review: Review) => (
        <Text variant="caption" className="text-slate-500">
          {formatDate(review.created_at)}
        </Text>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/reviews/${review.id}`, '_blank')}
            className="px-2 py-1"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          
          {review.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleModerate(review.id, 'approved')}
                className="px-2 py-1 text-green-600 border-green-200 hover:bg-green-50"
                disabled={moderationMutation.isPending}
              >
                <CheckIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleModerate(review.id, 'rejected')}
                className="px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
                disabled={moderationMutation.isPending}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(review.id)}
            className="px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
            disabled={deleteMutation.isPending}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [handleModerate, handleDelete, moderationMutation.isPending, deleteMutation.isPending]);

  const reviews = reviewsData?.data || [];
  const pagination = reviewsData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Management</h1>
          <Text variant="body" className="text-slate-600 mt-1">
            Monitor and moderate customer reviews and ratings
          </Text>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.open('/reviews/analytics', '_blank')}
            className="flex items-center space-x-2"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Analytics</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('/reviews/flagged', '_blank')}
            className="flex items-center space-x-2"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>Flagged Reviews</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Total Reviews</Text>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.total_reviews)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Average Rating</Text>
              <div className="text-2xl font-bold text-slate-900">
                {stats.average_rating.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Pending Reviews</Text>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.pending_reviews)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FlagIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Flagged Reviews</Text>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.flagged_reviews)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews, users, or services..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-3">
            <Select
              value={filters.status || ''}
              onChange={(value: string) => handleFilterChange('status', value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'flagged', label: 'Flagged' }
              ]}
              placeholder="All Statuses"
              className="w-40"
            />

            <Select
              value={String(filters.rating || '')}
              onChange={(value: string) => handleFilterChange('rating', value)}
              options={[
                { value: '', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' }
              ]}
              placeholder="All Ratings"
              className="w-32"
            />

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={filters.sort_by || ''}
                onChange={(value: string) => handleFilterChange('sort_by', value)}
                options={[
                  { value: 'created_at', label: 'Date Created' },
                  { value: 'rating', label: 'Rating' },
                  { value: 'helpful_count', label: 'Helpful Votes' },
                  { value: 'reported_count', label: 'Reports' }
                ]}
                placeholder="Sort by"
              />

              <Select
                value={filters.sort_order || ''}
                onChange={(value: string) => handleFilterChange('sort_order', value)}
                options={[
                  { value: 'desc', label: 'Descending' },
                  { value: 'asc', label: 'Ascending' }
                ]}
                placeholder="Sort order"
              />

              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ sort_by: 'created_at', sort_order: 'desc' });
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="justify-center"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <Text variant="body" className="text-blue-800">
              {selectedRows.length} review(s) selected
            </Text>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('approve')}
                disabled={bulkModerationMutation.isPending}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Approve
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reject')}
                disabled={bulkModerationMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Reject
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('flag')}
                disabled={bulkModerationMutation.isPending}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <FlagIcon className="w-4 h-4 mr-1" />
                Flag
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRows([])}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Table */}
      <Table
        data={reviews}
        columns={columns}
        loading={reviewsLoading}
        pagination={pagination ? {
          currentPage: pagination.current_page,
          pageSize: pagination.per_page,
          totalItems: pagination.total,
          onPageChange: setCurrentPage,
        } : undefined}
      />
    </div>
  );
};

export default ReviewManagement;