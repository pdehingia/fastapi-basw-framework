/**
 * Portfolio Moderation Component
 * Interface for moderating artist portfolio images
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle, XCircle, AlertTriangle, Eye, Flag, Star, StarOff, 
  Search, Filter, Trash2
} from 'lucide-react';

import Table from '../../../molecules/Table';
import Button from '../../../atoms/Button';
import Badge from '../../../atoms/Badge';
import { useToast } from '../../../../hooks/ui/useToast';
import { 
  artistVerificationService, 
  type PortfolioItem, 
  type PortfolioFilters,
  type PortfolioModerationData,
  type BulkPortfolioModeration 
} from '../../../../services/api/artistVerificationService';

// Status badge mapping
const statusBadges = {
  pending: { variant: 'warning' as const, icon: AlertTriangle, label: 'Pending Review' },
  approved: { variant: 'success' as const, icon: CheckCircle, label: 'Approved' },
  rejected: { variant: 'error' as const, icon: XCircle, label: 'Rejected' },
  flagged: { variant: 'error' as const, icon: Flag, label: 'Flagged' },
};

interface PortfolioModerationProps {
  className?: string;
}

export const PortfolioModeration: React.FC<PortfolioModerationProps> = ({ className = '' }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState<PortfolioFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag'>('approve');
  const [moderationReason, setModerationReason] = useState('');

  // Queries
  const { data: portfolioData, isLoading, error } = useQuery({
    queryKey: ['portfolioModerationQueue', filters],
    queryFn: () => artistVerificationService.getPortfolioModerationQueue(filters),
    refetchInterval: 30000,
  });

  // Mutations
  const moderateImageMutation = useMutation({
    mutationFn: ({ imageId, moderationData }: { imageId: string; moderationData: PortfolioModerationData }) =>
      artistVerificationService.moderatePortfolioImage(imageId, moderationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioModerationQueue'] });
      toast({
        title: 'Success',
        description: 'Portfolio image moderated successfully',
      });
      setShowModerationModal(false);
      setSelectedImage(null);
      setModerationReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to moderate portfolio image',
        variant: 'destructive',
      });
    },
  });

  const bulkModerateMutation = useMutation({
    mutationFn: (bulkData: BulkPortfolioModeration) =>
      artistVerificationService.bulkModeratePortfolio(bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioModerationQueue'] });
      toast({
        title: 'Success',
        description: 'Bulk moderation completed successfully',
      });
      setSelectedImages([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to perform bulk moderation',
        variant: 'destructive',
      });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: ({ imageId, featured }: { imageId: string; featured: boolean }) =>
      artistVerificationService.togglePortfolioFeature(imageId, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioModerationQueue'] });
      toast({
        title: 'Success',
        description: 'Portfolio image feature status updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update feature status',
        variant: 'destructive',
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ imageId, reason }: { imageId: string; reason: string }) =>
      artistVerificationService.moderatePortfolioImage(imageId, { action: 'rejected', notes: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioModerationQueue'] });
      toast({
        title: 'Success',
        description: 'Portfolio image deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete portfolio image',
        variant: 'destructive',
      });
    },
  });

  const portfolioItems = portfolioData?.data || [];

  // Filter items by search term
  const filteredItems = portfolioItems.filter((item: PortfolioItem) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.artist_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModerate = (image: PortfolioItem, action: 'approve' | 'reject' | 'flag') => {
    setSelectedImage(image);
    setModerationAction(action);
    setShowModerationModal(true);
  };

  const handleModerationSubmit = () => {
    if (!selectedImage || !moderationReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a moderation reason',
        variant: 'destructive',
      });
      return;
    }

    const moderationData: PortfolioModerationData = {
      action: moderationAction === 'approve' ? 'approved' : 'rejected',
      notes: moderationReason,
    };

    moderateImageMutation.mutate({
      imageId: selectedImage.id,
      moderationData,
    });
  };

  const handleBulkModerate = (action: 'approve' | 'reject') => {
    if (selectedImages.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select images to moderate',
        variant: 'destructive',
      });
      return;
    }

    const bulkData: BulkPortfolioModeration = {
      image_ids: selectedImages,
      action: action === 'approve' ? 'approved' : 'rejected',
      notes: `Bulk ${action}d by admin`,
    };

    bulkModerateMutation.mutate(bulkData);
  };

  // Table configuration
  const tableConfig = {
    columns: [
      {
        key: 'select',
        header: '',
        render: (_value: any, item: PortfolioItem) => (
          <input
            type="checkbox"
            checked={selectedImages.includes(item.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedImages([...selectedImages, item.id]);
              } else {
                setSelectedImages(selectedImages.filter(id => id !== item.id));
              }
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
      },
      {
        key: 'image',
        header: 'Image',
        render: (_value: any, item: PortfolioItem) => (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={item.image_url}
              alt={item.title || 'Portfolio image'}
              className="w-full h-full object-cover"
            />
          </div>
        ),
      },
      {
        key: 'details',
        header: 'Details',
        render: (_value: any, item: PortfolioItem) => (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">{item.title || 'Untitled'}</div>
            <div className="text-sm text-gray-500">by Artist {item.artist_id}</div>
            {item.description && (
              <div className="text-xs text-gray-400 truncate max-w-xs">
                {item.description}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (_value: any, item: PortfolioItem) => {
          const statusConfig = statusBadges[item.status];
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
        key: 'featured',
        header: 'Featured',
        render: (_value: any, item: PortfolioItem) => (
          <div className="flex items-center space-x-2">
            {item.is_featured ? (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
        ),
      },
      {
        key: 'upload_date',
        header: 'Uploaded',
        render: (_value: any, item: PortfolioItem) => (
          <div className="text-sm text-gray-900">
            {new Date(item.uploaded_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_value: any, item: PortfolioItem) => (
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(item.image_url, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            {item.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate(item, 'approve')}
                  disabled={moderateImageMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate(item, 'reject')}
                  disabled={moderateImageMutation.isPending}
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate(item, 'flag')}
                  disabled={moderateImageMutation.isPending}
                >
                  <Flag className="w-4 h-4 text-orange-600" />
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFeatureMutation.mutate({
                imageId: item.id,
                featured: !item.is_featured
              })}
              disabled={toggleFeatureMutation.isPending}
            >
              {item.is_featured ? (
                <StarOff className="w-4 h-4" />
              ) : (
                <Star className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const reason = prompt('Please provide a reason for deletion:');
                if (reason) {
                  deleteImageMutation.mutate({
                    imageId: item.id,
                    reason,
                  });
                }
              }}
              disabled={deleteImageMutation.isPending}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ),
      },
    ],
    data: filteredItems,
    loading: isLoading,
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Portfolio Queue</h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['portfolioModerationQueue'] })}>
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
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Moderation</h1>
          <p className="text-gray-600 mt-1">
            Review and moderate artist portfolio images
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => window.open('/artist-verification', '_self')}
          >
            Verification Queue
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title or artist..."
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

            {selectedImages.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedImages.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkModerate('approve')}
                  disabled={bulkModerateMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkModerate('reject')}
                  disabled={bulkModerateMutation.isPending}
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
                  onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured
                </label>
                <select
                  value={filters.category?.toString() || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    category: e.target.value === '' ? undefined : e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.sort_by || ''}
                  onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
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
          emptyMessage="No portfolio images found"
        />
      </div>

      {/* Moderation Modal */}
      {showModerationModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {moderationAction === 'approve' ? 'Approve' : 
                 moderationAction === 'reject' ? 'Reject' : 'Flag'} Portfolio Image
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModerationModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Image Preview */}
              <div className="flex justify-center">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title || 'Portfolio image'}
                  className="max-w-full max-h-64 object-contain rounded-lg"
                />
              </div>

              {/* Image Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{selectedImage.title || 'Untitled'}</h4>
                <p className="text-sm text-gray-600">by Artist {selectedImage.artist_id}</p>
                {selectedImage.description && (
                  <p className="text-sm text-gray-600 mt-2">{selectedImage.description}</p>
                )}
              </div>

              {/* Moderation Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for {moderationAction} *
                </label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder={`Please provide reason for ${moderationAction}...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModerationModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModerationSubmit}
                  disabled={moderateImageMutation.isPending || !moderationReason.trim()}
                  className={moderationAction === 'reject' || moderationAction === 'flag' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {moderateImageMutation.isPending ? 'Processing...' : 
                   `${moderationAction.charAt(0).toUpperCase() + moderationAction.slice(1)} Image`
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioModeration;
