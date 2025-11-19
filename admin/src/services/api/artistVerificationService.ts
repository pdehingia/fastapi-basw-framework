/**
 * Artist Verification API Service
 * Handles all artist verification and portfolio moderation operations
 */

import { API_BASE_URL, ARTIST_VERIFICATION_ENDPOINTS } from '@/config/api';

// Artist Verification types and interfaces
export interface VerificationRequest {
  id: string;
  artist_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  verification_type: 'basic' | 'professional' | 'elite';
  verification_badge?: 'verified' | 'verified_pro' | 'verified_elite';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  documents: VerificationDocument[];
  artist: {
    id: string;
    full_name: string;
    email: string;
    business_name?: string;
    phone: string;
    avatar_url?: string;
    profile_completion: number;
  };
}

export interface VerificationDocument {
  id: string;
  type: 'id_card' | 'business_license' | 'portfolio' | 'certificate' | 'insurance' | 'other';
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  notes?: string;
}

export interface PortfolioItem {
  id: string;
  artist_id: string;
  image_url: string;
  title?: string;
  description?: string;
  category: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  moderation_notes?: string;
  uploaded_at: string;
  moderated_at?: string;
  moderated_by?: string;
  is_featured: boolean;
  likes_count: number;
  views_count: number;
}

export interface VerificationFilters {
  page?: number;
  limit?: number;
  status?: string;
  verification_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: 'submitted_at' | 'reviewed_at' | 'artist_name';
  sort_order?: 'asc' | 'desc';
}

export interface PortfolioFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  artist_id?: string;
  sort_by?: 'uploaded_at' | 'moderated_at' | 'likes_count' | 'views_count';
  sort_order?: 'asc' | 'desc';
}

export interface VerificationDecision {
  decision: 'approved' | 'rejected';
  verification_badge?: 'verified' | 'verified_pro' | 'verified_elite';
  notes?: string;
  notify_artist?: boolean;
}

export interface PortfolioModerationData {
  action: 'approved' | 'rejected';
  notes?: string;
  feature?: boolean;
}

export interface BulkPortfolioModeration {
  image_ids: string[];
  action: 'approved' | 'rejected' | 'feature' | 'unfeature';
  notes?: string;
}

export interface VerificationStats {
  total_requests: number;
  pending_requests: number;
  approved_rate: number;
  average_review_time: number; // in hours
  recent_approvals: number;
  portfolio_stats: {
    total_images: number;
    pending_moderation: number;
    approval_rate: number;
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

class ArtistVerificationService {
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
   * Get verification queue with filtering and pagination
   */
  async getVerificationQueue(filters: VerificationFilters = {}): Promise<ApiResponse<VerificationRequest[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.QUEUE}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VerificationRequest[]>>(response);
  }

  /**
   * Get verification request details by ID
   */
  async getVerificationRequest(requestId: string): Promise<ApiResponse<VerificationRequest>> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.GET_REQUEST(requestId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VerificationRequest>>(response);
  }

  /**
   * Make verification decision (approve/reject)
   */
  async makeVerificationDecision(requestId: string, decision: VerificationDecision): Promise<ApiResponse<VerificationRequest>> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.DECISION(requestId)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(decision),
    });

    return this.handleResponse<ApiResponse<VerificationRequest>>(response);
  }

  /**
   * Get portfolio moderation queue
   */
  async getPortfolioModerationQueue(filters: PortfolioFilters = {}): Promise<ApiResponse<PortfolioItem[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.PORTFOLIO_QUEUE}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<PortfolioItem[]>>(response);
  }

  /**
   * Moderate portfolio image
   */
  async moderatePortfolioImage(imageId: string, moderationData: PortfolioModerationData): Promise<ApiResponse<PortfolioItem>> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.MODERATE_PORTFOLIO(imageId)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(moderationData),
    });

    return this.handleResponse<ApiResponse<PortfolioItem>>(response);
  }

  /**
   * Bulk moderate portfolio images
   */
  async bulkModeratePortfolio(bulkData: BulkPortfolioModeration): Promise<ApiResponse<{ processed_count: number }>> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.BULK_MODERATE_PORTFOLIO}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bulkData),
    });

    return this.handleResponse<ApiResponse<{ processed_count: number }>>(response);
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats(): Promise<ApiResponse<VerificationStats>> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.STATS}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VerificationStats>>(response);
  }

  /**
   * Get artist portfolio by artist ID
   */
  async getArtistPortfolio(artistId: string, filters: PortfolioFilters = {}): Promise<ApiResponse<PortfolioItem[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('artist_id', artistId);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.PORTFOLIO}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<PortfolioItem[]>>(response);
  }

  /**
   * Download verification document
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.DOWNLOAD_DOCUMENT(documentId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return response.blob();
  }

  /**
   * Feature/Unfeature portfolio image
   */
  async togglePortfolioFeature(imageId: string, featured: boolean): Promise<ApiResponse<PortfolioItem>> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.TOGGLE_PORTFOLIO_FEATURE(imageId)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ is_featured: featured }),
    });

    return this.handleResponse<ApiResponse<PortfolioItem>>(response);
  }

  /**
   * Get verification request history for an artist
   */
  async getArtistVerificationHistory(artistId: string): Promise<ApiResponse<VerificationRequest[]>> {
    const url = `${this.baseUrl}${ARTIST_VERIFICATION_ENDPOINTS.ARTIST_HISTORY(artistId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<VerificationRequest[]>>(response);
  }
}

// Export singleton instance
export const artistVerificationService = new ArtistVerificationService();
export default artistVerificationService;