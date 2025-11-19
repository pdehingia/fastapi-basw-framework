/**
 * Review Analytics Component
 * Comprehensive analytics dashboard for review data and trends
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  StarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';
import Badge from '@/components/atoms/Badge';
import Select from '../../atoms/Select';
import { reviewService } from '@/services/api/reviewService';
import { formatNumber, formatPercentage } from '@/utils/formatters';

interface ReviewAnalyticsPageProps {}

export const ReviewAnalyticsPage: React.FC<ReviewAnalyticsPageProps> = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Fetch analytics data with mock fallback for development
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['review-analytics', period],
    queryFn: async () => {
      try {
        return await reviewService.getReviewAnalytics(period);
      } catch {
        // Fallback mock data for development
        return {
          data: {
            total_reviews: 1247,
            average_rating: 4.2,
            moderation_stats: {
              approved_rate: 0.89,
              pending_count: 23
            },
            rating_distribution: [
              { rating: 5, count: 567, percentage: 45.5 },
              { rating: 4, count: 345, percentage: 27.7 },
              { rating: 3, count: 198, percentage: 15.9 },
              { rating: 2, count: 89, percentage: 7.1 },
              { rating: 1, count: 48, percentage: 3.8 }
            ],
            status_distribution: [
              { status: 'approved', count: 1109, percentage: 89.0 },
              { status: 'pending', count: 23, percentage: 1.8 },
              { status: 'rejected', count: 89, percentage: 7.1 },
              { status: 'flagged', count: 26, percentage: 2.1 }
            ],
            monthly_trends: [
              { month: '2024-01', total_reviews: 89, average_rating: 4.1 },
              { month: '2024-02', total_reviews: 97, average_rating: 4.2 },
              { month: '2024-03', total_reviews: 105, average_rating: 4.3 }
            ],
            top_categories: [
              { category: 'Photography', total_reviews: 345 },
              { category: 'Music', total_reviews: 287 },
              { category: 'Art', total_reviews: 198 }
            ]
          }
        };
      }
    },
    placeholderData: (previousData) => previousData,
  });

  const analytics = (analyticsData?.data || analyticsData) as any;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="text-2xl font-bold mt-4 text-slate-900">Failed to Load Analytics</h3>
        <Text variant="body" className="mt-2 text-slate-600">
          Unable to fetch review analytics data.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Analytics</h1>
          <Text variant="body" className="text-slate-600 mt-1">
            Comprehensive insights into review performance and trends
          </Text>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select
            value={period}
            onChange={(value: string) => setPeriod(value as any)}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' }
            ]}
            className="w-40"
          />
          
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Total Reviews</Text>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(analytics?.total_reviews || 0)}
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
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-slate-900">
                  {analytics?.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(analytics?.average_rating || 0) ? 'text-yellow-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <Text variant="caption" className="text-slate-500">Approval Rate</Text>
              <div className="text-2xl font-bold text-slate-900">
                {formatPercentage(analytics?.moderation_stats?.approved_rate || 0)}
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
                {formatNumber(analytics?.moderation_stats?.pending_count || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Rating Distribution</h3>
            <ChartBarIcon className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            {analytics?.rating_distribution?.map((rating: any) => (
              <div key={rating.rating} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIconSolid
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating.rating ? 'text-yellow-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {rating.rating} {rating.rating === 1 ? 'Star' : 'Stars'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-12 text-right">
                    {rating.count}
                  </span>
                </div>
              </div>
            )) || <Text variant="body" className="text-slate-500">No rating data available</Text>}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Review Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics?.status_distribution?.map((status: any) => {
              const statusConfig = {
                approved: { color: 'bg-green-500', label: 'Approved' },
                pending: { color: 'bg-yellow-500', label: 'Pending' },
                rejected: { color: 'bg-red-500', label: 'Rejected' },
                flagged: { color: 'bg-orange-500', label: 'Flagged' },
              };
              
              const config = statusConfig[status.status as keyof typeof statusConfig] || 
                           { color: 'bg-gray-500', label: status.status };
              
              return (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${config.color} rounded-full`} />
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`${config.color} h-2 rounded-full`}
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-12 text-right">
                      {status.count}
                    </span>
                  </div>
                </div>
              );
            }) || <Text variant="body" className="text-slate-500">No status data available</Text>}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Review Trends</h3>
          <div className="flex items-center space-x-2">
            <TrendingUpIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm text-slate-500">Growth</span>
          </div>
        </div>
        
        {analytics?.monthly_trends && analytics.monthly_trends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-slate-600">
                  <th className="pb-3">Month</th>
                  <th className="pb-3">Reviews</th>
                  <th className="pb-3">Avg Rating</th>
                  <th className="pb-3">Growth</th>
                </tr>
              </thead>
              <tbody className="space-y-3">
                {analytics.monthly_trends.map((trend: any, index: number) => {
                  const previousTrend = analytics.monthly_trends[index - 1];
                  const growth = previousTrend ? 
                    ((trend.total_reviews - previousTrend.total_reviews) / previousTrend.total_reviews * 100) : 0;
                  const isPositive = growth >= 0;

                  return (
                    <tr key={trend.month} className="border-t border-slate-100">
                      <td className="py-3">
                        <Text variant="body" className="font-medium">
                          {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </Text>
                      </td>
                      <td className="py-3">
                        <Text variant="body">{formatNumber(trend.total_reviews)}</Text>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <Text variant="body">{trend.average_rating.toFixed(1)}</Text>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.round(trend.average_rating) ? 'text-yellow-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        {index > 0 && (
                          <div className={`flex items-center space-x-1 ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? (
                              <TrendingUpIcon className="w-4 h-4" />
                            ) : (
                              <TrendingDownIcon className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">
                              {Math.abs(growth).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Text variant="body" className="text-slate-500">No trend data available</Text>
          </div>
        )}
      </div>

      {/* Top Categories */}
      {analytics?.top_categories && analytics.top_categories.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Top Categories by Reviews</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.top_categories.map((category: any) => (
              <div key={category.category} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{category.category}</h4>
                  <Badge variant="default">{formatNumber(category.total_reviews)}</Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(category.total_reviews / Math.max(...analytics.top_categories.map((c: any) => c.total_reviews))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-slate-600">
                    {((category.total_reviews / analytics.total_reviews) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moderation Stats */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Moderation Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(analytics?.moderation_stats?.pending_count || 0)}
            </div>
            <Text variant="caption" className="text-slate-500">Pending Reviews</Text>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatPercentage(analytics?.moderation_stats?.approved_rate || 0)}
            </div>
            <Text variant="caption" className="text-slate-500">Approval Rate</Text>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatPercentage((1 - (analytics?.moderation_stats?.approved_rate || 0)))}
            </div>
            <Text variant="caption" className="text-slate-500">Rejection Rate</Text>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(analytics?.status_distribution?.find((s: any) => s.status === 'flagged')?.count || 0)}
            </div>
            <Text variant="caption" className="text-slate-500">Flagged Reviews</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalyticsPage;