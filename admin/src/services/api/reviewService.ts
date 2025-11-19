/**
 * Review Management API Service
 * Handles all review-related API operations
 */

import { API_BASE_URL, REVIEW_ENDPOINTS } from '@/config/api';

// Review types and interfaces
export interface Review {
  id: string;
  user_id: string;
  provider_id: string;
  service_id: string;
  booking_id: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  is_featured: boolean;
  admin_notes?: string;
  flagged_reasons?: string[];
  helpful_count: number;
  reported_count: number;
  created_at: string;
  updated_at: string;
  moderated_at?: string;
  moderated_by?: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  provider: {
    id: string;
    business_name: string;
    avatar_url?: string;
  };
  service: {
    id: string;
    title: string;
    category: string;
  };
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  rating?: number | string;
  status?: string;
  provider_id?: string;
  service_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'rating' | 'helpful_count' | 'reported_count';
  sort_order?: 'asc' | 'desc';
}

export interface ReviewModerationData {
  status: 'approved' | 'rejected';
  admin_notes?: string;
  notify_user?: boolean;
  notify_provider?: boolean;
}

export interface BulkModerationData {
  review_ids: string[];
  action: 'approve' | 'reject' | 'flag' | 'feature' | 'delete';
  admin_notes?: string;
  notify_reviewers?: boolean;
  notify_providers?: boolean;
}

export interface ReviewAnalytics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  status_distribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  monthly_trends: {
    month: string;
    total_reviews: number;
    average_rating: number;
    moderation_rate: number;
  }[];
  top_categories: {
    category: string;
    total_reviews: number;
    average_rating: number;
  }[];
  moderation_stats: {
    pending_count: number;
    approved_rate: number;
    rejected_rate: number;
    flagged_count: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

class ReviewService {
  private baseUrl = API_BASE_URL;

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get reviews with filtering and pagination
   */
  async getReviews(filters: ReviewFilters = {}): Promise<ApiResponse<Review[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}${REVIEW_ENDPOINTS.LIST}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<Review[]>>(response);
  }

  /**
   * Get review details by ID
   */
  async getReviewById(reviewId: string): Promise<ApiResponse<Review>> {
    const url = `${this.baseUrl}${REVIEW_ENDPOINTS.GET(reviewId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<Review>>(response);
  }

  /**
   * Moderate a review (approve/reject)
   */
  async moderateReview(reviewId: string, moderationData: ReviewModerationData): Promise<ApiResponse<Review>> {
    const url = `${this.baseUrl}${REVIEW_ENDPOINTS.MODERATE(reviewId)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(moderationData),
    });

    return this.handleResponse<ApiResponse<Review>>(response);
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    const url = `${API_BASE_URL}${REVIEW_ENDPOINTS.DELETE(reviewId)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<void>>(response);
  }

  /**
   * Get review analytics
   */
  async getReviewAnalytics(period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<ApiResponse<ReviewAnalytics>> {
    const url = `${API_BASE_URL}${REVIEW_ENDPOINTS.ANALYTICS}?period=${period}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<ReviewAnalytics>>(response);
  }

  /**
   * Bulk moderate reviews
   */
  async bulkModerateReviews(bulkData: BulkModerationData): Promise<ApiResponse<{ processed_count: number }>> {
    const url = `${API_BASE_URL}${REVIEW_ENDPOINTS.BULK_MODERATE}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bulkData)
    });

    return this.handleResponse<ApiResponse<{ processed_count: number }>>(response);
  }

  /**
   * Get flagged reviews
   */
  async getFlaggedReviews(page: number = 1, limit: number = 20): Promise<ApiResponse<Review[]>> {
    const url = `${API_BASE_URL}${REVIEW_ENDPOINTS.FLAGGED}?page=${page}&limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<Review[]>>(response);
  }

  /**
   * Feature/Unfeature a review
   */
  async toggleReviewFeature(reviewId: string, featured: boolean): Promise<ApiResponse<Review>> {
    const url = `${API_BASE_URL}${REVIEW_ENDPOINTS.GET(reviewId)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ is_featured: featured }),
    });

    return this.handleResponse<ApiResponse<Review>>(response);
  }

  /**
   * Get reviews by provider ID
   */
  async getReviewsByProvider(providerId: string, filters: ReviewFilters = {}): Promise<ApiResponse<Review[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('provider_id', providerId);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}${REVIEW_ENDPOINTS.LIST}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<Review[]>>(response);
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
export default reviewService;