import { apiService } from './base';
import type {
  ContentItem,
  ContentCategory,
  ContentTag,
  MediaFile,
  MediaFolder,
  ContentTemplate,
  ContentAnalytics,
  ContentSchedule,
  SEOAnalysis,
  ContentWorkflow,
  ContentReview,
  ContentListResponse,
  MediaLibraryResponse,
  ContentTemplateListResponse,
  CreateContentRequest,
  UpdateContentRequest,
  CreateMediaRequest,
  CreateContentTemplateRequest,
  BulkContentOperation,
  ApiResponse,
} from '@/types/api.types';

// ==================== CONTENT OPERATIONS ====================

export const ContentService = {
  // Content CRUD operations
  getContent: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: ContentItem['type'];
    status?: ContentItem['status'];
    category?: string;
    tag?: string;
    author?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: 'created_at' | 'updated_at' | 'published_at' | 'title' | 'view_count';
    sort_order?: 'asc' | 'desc';
  }): Promise<ContentListResponse> => {
    const response = await apiClient.get('/admin/content', { params });
    return response.data;
  },

  getContentById: async (id: string): Promise<ContentItem> => {
    const response = await apiClient.get(`/admin/content/${id}`);
    return response.data;
  },

  createContent: async (data: CreateContentRequest): Promise<ContentItem> => {
    const response = await apiClient.post('/admin/content', data);
    return response.data;
  },

  updateContent: async (data: UpdateContentRequest): Promise<ContentItem> => {
    const response = await apiClient.put(`/admin/content/${data.id}`, data);
    return response.data;
  },

  deleteContent: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/content/${id}`);
    return response.data;
  },

  duplicateContent: async (id: string): Promise<ContentItem> => {
    const response = await apiClient.post(`/admin/content/${id}/duplicate`);
    return response.data;
  },

  publishContent: async (id: string): Promise<ContentItem> => {
    const response = await apiClient.post(`/admin/content/${id}/publish`);
    return response.data;
  },

  unpublishContent: async (id: string): Promise<ContentItem> => {
    const response = await apiClient.post(`/admin/content/${id}/unpublish`);
    return response.data;
  },

  scheduleContent: async (id: string, scheduledFor: string): Promise<ContentSchedule> => {
    const response = await apiClient.post(`/admin/content/${id}/schedule`, {
      scheduled_for: scheduledFor,
    });
    return response.data;
  },

  bulkContentOperation: async (operation: BulkContentOperation): Promise<ApiResponse> => {
    const response = await apiClient.post('/admin/content/bulk', operation);
    return response.data;
  },

  // Content preview and SEO
  previewContent: async (id: string): Promise<{ preview_url: string }> => {
    const response = await apiClient.get(`/admin/content/${id}/preview`);
    return response.data;
  },

  analyzeSEO: async (id: string): Promise<SEOAnalysis> => {
    const response = await apiClient.post(`/admin/content/${id}/seo-analysis`);
    return response.data;
  },

  generateSlug: async (title: string): Promise<{ slug: string }> => {
    const response = await apiClient.post('/admin/content/generate-slug', { title });
    return response.data;
  },

  checkSlugAvailability: async (slug: string, excludeId?: string): Promise<{ available: boolean }> => {
    const response = await apiClient.post('/admin/content/check-slug', { slug, exclude_id: excludeId });
    return response.data;
  },

  // Content analytics
  getContentAnalytics: async (id: string, period?: {
    start_date: string;
    end_date: string;
  }): Promise<ContentAnalytics> => {
    const response = await apiClient.get(`/admin/content/${id}/analytics`, { params: period });
    return response.data;
  },

  getTopContent: async (params?: {
    period: 'day' | 'week' | 'month' | 'year';
    metric: 'views' | 'likes' | 'shares' | 'engagement';
    limit?: number;
  }): Promise<ContentItem[]> => {
    const response = await apiClient.get('/admin/content/top', { params });
    return response.data;
  },

  getTrendingContent: async (limit = 10): Promise<ContentItem[]> => {
    const response = await apiClient.get('/admin/content/trending', { params: { limit } });
    return response.data;
  },
};

// ==================== CATEGORY OPERATIONS ====================

export const CategoryService = {
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    parent_id?: string;
    flat?: boolean;
  }): Promise<ContentCategory[]> => {
    const response = await apiClient.get('/admin/content/categories', { params });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<ContentCategory> => {
    const response = await apiClient.get(`/admin/content/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: Omit<ContentCategory, 'id' | 'content_count' | 'created_at' | 'updated_at'>): Promise<ContentCategory> => {
    const response = await apiClient.post('/admin/content/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<ContentCategory>): Promise<ContentCategory> => {
    const response = await apiClient.put(`/admin/content/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/content/categories/${id}`);
    return response.data;
  },

  reorderCategories: async (categories: Array<{ id: string; sort_order: number }>): Promise<ApiResponse> => {
    const response = await apiClient.post('/admin/content/categories/reorder', { categories });
    return response.data;
  },
};

// ==================== TAG OPERATIONS ====================

export const TagService = {
  getTags: async (params?: {
    search?: string;
    limit?: number;
    popular?: boolean;
  }): Promise<ContentTag[]> => {
    const response = await apiClient.get('/admin/content/tags', { params });
    return response.data;
  },

  createTag: async (data: { name: string; description?: string; color?: string }): Promise<ContentTag> => {
    const response = await apiClient.post('/admin/content/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: Partial<ContentTag>): Promise<ContentTag> => {
    const response = await apiClient.put(`/admin/content/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/content/tags/${id}`);
    return response.data;
  },

  mergeTags: async (sourceTagId: string, targetTagId: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/admin/content/tags/merge', {
      source_tag_id: sourceTagId,
      target_tag_id: targetTagId,
    });
    return response.data;
  },
};

// ==================== MEDIA OPERATIONS ====================

export const MediaService = {
  getMediaFiles: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: MediaFile['file_type'];
    folder_id?: string;
    sort_by?: 'upload_date' | 'filename' | 'file_size';
    sort_order?: 'asc' | 'desc';
  }): Promise<MediaLibraryResponse> => {
    const response = await apiClient.get('/admin/media', { params });
    return response.data;
  },

  getMediaFile: async (id: string): Promise<MediaFile> => {
    const response = await apiClient.get(`/admin/media/${id}`);
    return response.data;
  },

  uploadMedia: async (data: CreateMediaRequest): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) formData.append('title', data.title);
    if (data.alt_text) formData.append('alt_text', data.alt_text);
    if (data.caption) formData.append('caption', data.caption);
    if (data.description) formData.append('description', data.description);
    if (data.folder_id) formData.append('folder_id', data.folder_id);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));

    const response = await apiClient.post('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMedia: async (id: string, data: Partial<MediaFile>): Promise<MediaFile> => {
    const response = await apiClient.put(`/admin/media/${id}`, data);
    return response.data;
  },

  deleteMedia: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/media/${id}`);
    return response.data;
  },

  bulkDeleteMedia: async (ids: string[]): Promise<ApiResponse> => {
    const response = await apiClient.post('/admin/media/bulk-delete', { ids });
    return response.data;
  },

  moveMedia: async (ids: string[], folderId?: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/admin/media/move', { ids, folder_id: folderId });
    return response.data;
  },

  // Folder operations
  getFolders: async (): Promise<MediaFolder[]> => {
    const response = await apiClient.get('/admin/media/folders');
    return response.data;
  },

  createFolder: async (data: { name: string; parent_id?: string; description?: string }): Promise<MediaFolder> => {
    const response = await apiClient.post('/admin/media/folders', data);
    return response.data;
  },

  updateFolder: async (id: string, data: Partial<MediaFolder>): Promise<MediaFolder> => {
    const response = await apiClient.put(`/admin/media/folders/${id}`, data);
    return response.data;
  },

  deleteFolder: async (id: string, moveContents?: boolean): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/media/folders/${id}`, {
      params: { move_contents: moveContents },
    });
    return response.data;
  },

  // Media optimization and processing
  optimizeImage: async (id: string): Promise<MediaFile> => {
    const response = await apiClient.post(`/admin/media/${id}/optimize`);
    return response.data;
  },

  generateThumbnails: async (id: string, sizes: number[]): Promise<{ thumbnails: Record<string, string> }> => {
    const response = await apiClient.post(`/admin/media/${id}/thumbnails`, { sizes });
    return response.data;
  },

  getMediaUsage: async (id: string): Promise<{ usage: Array<{ content_id: string; content_title: string; usage_type: string }> }> => {
    const response = await apiClient.get(`/admin/media/${id}/usage`);
    return response.data;
  },
};

// ==================== TEMPLATE OPERATIONS ====================

export const TemplateService = {
  getTemplates: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: ContentTemplate['type'];
    active?: boolean;
  }): Promise<ContentTemplateListResponse> => {
    const response = await apiClient.get('/admin/content/templates', { params });
    return response.data;
  },

  getTemplate: async (id: string): Promise<ContentTemplate> => {
    const response = await apiClient.get(`/admin/content/templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: CreateContentTemplateRequest): Promise<ContentTemplate> => {
    const response = await apiClient.post('/admin/content/templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<CreateContentTemplateRequest>): Promise<ContentTemplate> => {
    const response = await apiClient.put(`/admin/content/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/content/templates/${id}`);
    return response.data;
  },

  duplicateTemplate: async (id: string): Promise<ContentTemplate> => {
    const response = await apiClient.post(`/admin/content/templates/${id}/duplicate`);
    return response.data;
  },

  previewTemplate: async (id: string, sampleData?: Record<string, any>): Promise<{ preview_html: string }> => {
    const response = await apiClient.post(`/admin/content/templates/${id}/preview`, { sample_data: sampleData });
    return response.data;
  },
};

// ==================== WORKFLOW OPERATIONS ====================

export const WorkflowService = {
  getWorkflows: async (): Promise<ContentWorkflow[]> => {
    const response = await apiClient.get('/admin/content/workflows');
    return response.data;
  },

  getWorkflow: async (id: string): Promise<ContentWorkflow> => {
    const response = await apiClient.get(`/admin/content/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (data: Omit<ContentWorkflow, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<ContentWorkflow> => {
    const response = await apiClient.post('/admin/content/workflows', data);
    return response.data;
  },

  updateWorkflow: async (id: string, data: Partial<ContentWorkflow>): Promise<ContentWorkflow> => {
    const response = await apiClient.put(`/admin/content/workflows/${id}`, data);
    return response.data;
  },

  deleteWorkflow: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/content/workflows/${id}`);
    return response.data;
  },

  // Review operations
  getPendingReviews: async (userId?: string): Promise<ContentReview[]> => {
    const response = await apiClient.get('/admin/content/reviews/pending', {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
  },

  submitReview: async (data: {
    content_id: string;
    workflow_step_id: string;
    status: ContentReview['status'];
    comments?: string;
    changes_requested?: ContentReview['changes_requested'];
  }): Promise<ContentReview> => {
    const response = await apiClient.post('/admin/content/reviews', data);
    return response.data;
  },

  getContentReviews: async (contentId: string): Promise<ContentReview[]> => {
    const response = await apiClient.get(`/admin/content/${contentId}/reviews`);
    return response.data;
  },
};

// ==================== SCHEDULE OPERATIONS ====================

export const ScheduleService = {
  getScheduledContent: async (params?: {
    page?: number;
    limit?: number;
    from_date?: string;
    to_date?: string;
    status?: ContentSchedule['status'];
  }): Promise<ContentSchedule[]> => {
    const response = await apiClient.get('/admin/content/schedule', { params });
    return response.data;
  },

  cancelSchedule: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/admin/content/schedule/${id}`);
    return response.data;
  },

  updateSchedule: async (id: string, scheduledFor: string): Promise<ContentSchedule> => {
    const response = await apiClient.put(`/admin/content/schedule/${id}`, {
      scheduled_for: scheduledFor,
    });
    return response.data;
  },

  executeScheduledAction: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.post(`/admin/content/schedule/${id}/execute`);
    return response.data;
  },
};