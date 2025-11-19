/**
 * Flagged Reviews Component
 * Management interface for reviews that have been flagged for moderation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FlagIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingStorefrontIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '../../atoms/Button';
import Table from '../../molecules/Table';
import Badge from '../../atoms/Badge';
import Text from '../../atoms/Text';
import { reviewService, type Review } from '../../../services/api/reviewService';
import { useToast } from '../../../hooks/ui/useToast';
import { formatDate, formatNumber } from '../../../utils/formatters';

interface FlaggedReviewsProps {}

export const FlaggedReviews: React.FC<FlaggedReviewsProps> = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch flagged reviews
  const {
    data: flaggedData,
    isLoading,
  } = useQuery({
    queryKey: ['flagged-reviews', currentPage, pageSize],
    queryFn: () => reviewService.getFlaggedReviews(currentPage, pageSize),
    placeholderData: (previousData) => previousData,
  });

  // Moderation mutation
  const moderationMutation = useMutation({
    mutationFn: ({ reviewId, status, notes }: { reviewId: string; status: 'approved' | 'rejected'; notes?: string }) =>
      reviewService.moderateReview(reviewId, { status, admin_notes: notes }),
    onSuccess: (_data, variables) => {
      toast({
        variant: 'success',
        title: 'Review Moderated',
        description: `Review has been ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
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
    onSuccess: (data, _variables) => {
      toast({
        variant: 'success',
        title: 'Bulk Action Complete',
        description: `${data.data.processed_count} reviews processed`,
      });
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
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
        description: 'Flagged review has been permanently removed',
      });
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete review',
      });
    },
  });

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
        description: 'Please select reviews to perform bulk actions',
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
    if (window.confirm('Are you sure you want to permanently delete this flagged review?')) {
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
      header: 'Review Content',
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
      key: 'flagged_reasons',
      header: 'Flagged Reasons',
      sortable: false,
      render: (review: Review) => (
        <div className="space-y-1">
          {review.flagged_reasons && review.flagged_reasons.length > 0 ? (
            review.flagged_reasons.map((reason, index) => (
              <Badge key={index} variant="error" className="text-xs">
                {reason}
              </Badge>
            ))
          ) : (
            <Badge variant="error">General Report</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'reports',
      header: 'Reports',
      sortable: true,
      render: (review: Review) => (
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-red-500">
            <FlagIcon className="w-4 h-4" />
            <span className="font-medium">{formatNumber(review.reported_count || 0)}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-slate-500">
            <HeartIcon className="w-4 h-4" />
            <span>{formatNumber(review.helpful_count || 0)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Date Flagged',
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleModerate(review.id, 'approved', 'Approved after review of flags')}
            className="px-2 py-1 text-green-600 border-green-200 hover:bg-green-50"
            disabled={moderationMutation.isPending}
          >
            <CheckIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleModerate(review.id, 'rejected', 'Rejected due to policy violations')}
            className="px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
            disabled={moderationMutation.isPending}
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
          
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

  const reviews = flaggedData?.data || [];
  const pagination = flaggedData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flagged Reviews</h1>
          <Text variant="body" className="text-slate-600 mt-1">
            Reviews that have been reported by users and require moderation
          </Text>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.open('/reviews', '_blank')}
          >
            All Reviews
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('/reviews/analytics', '_blank')}
          >
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FlagIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Total Flagged</Text>
              <Text variant="lead" className="text-slate-900 font-bold">
                {pagination ? formatNumber(pagination.total) : '0'}
              </Text>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Needs Review</Text>
              <Text variant="lead" className="text-slate-900 font-bold">
                {formatNumber(reviews.filter(r => r.status === 'flagged').length)}
              </Text>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">High Priority</Text>
              <Text variant="lead" className="text-slate-900 font-bold">
                {formatNumber(reviews.filter(r => (r.reported_count || 0) >= 5).length)}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Guidelines */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-amber-800 font-medium mb-2">Review Moderation Guidelines</h3>
            <div className="text-sm text-amber-700 space-y-1">
              <p>• <strong>Approve:</strong> Reviews that comply with community guidelines despite reports</p>
              <p>• <strong>Reject:</strong> Reviews containing hate speech, spam, fake content, or policy violations</p>
              <p>• <strong>Delete:</strong> Severely inappropriate content that violates platform terms</p>
              <p>• <strong>High Priority:</strong> Reviews with 5+ reports should be addressed immediately</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <Text variant="body" className="text-blue-800">
              {selectedRows.length} flagged review(s) selected
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
                Approve All
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reject')}
                disabled={bulkModerationMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Reject All
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={bulkModerationMutation.isPending}
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete All
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

      {/* Flagged Reviews Table */}
      <Table
        data={reviews}
        columns={columns}
        loading={isLoading}
        pagination={pagination ? {
          currentPage: pagination.current_page,
          pageSize: pagination.per_page,
          totalItems: pagination.total,
          onPageChange: setCurrentPage,
        } : undefined}
        emptyMessage="No flagged reviews found"
      />

      {/* Moderation Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-slate-900 font-medium mb-4">Moderation Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <h4 className="font-medium text-slate-800 mb-2">When to Approve:</h4>
            <ul className="space-y-1">
              <li>• Constructive criticism with valid points</li>
              <li>• Factual negative experiences</li>
              <li>• Reviews with minor language issues</li>
              <li>• False positive reports</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-2">When to Reject:</h4>
            <ul className="space-y-1">
              <li>• Hate speech or discrimination</li>
              <li>• Fake or spam reviews</li>
              <li>• Personal attacks on providers</li>
              <li>• Reviews violating platform policies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlaggedReviews;
