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
    const response = await apiService.get('/admin/content', { params });
    return response;
  },

  getContentById: async (id: string): Promise<ContentItem> => {
    const response = await apiService.get(`/admin/content/${id}`);
    return response;
  },

  createContent: async (data: CreateContentRequest): Promise<ContentItem> => {
    const response = await apiService.post('/admin/content', data);
    return response;
  },

  updateContent: async (data: UpdateContentRequest): Promise<ContentItem> => {
    const response = await apiService.put(`/admin/content/${data.id}`, data);
    return response;
  },

  deleteContent: async (id: string): Promise<any> => {
    const response = await apiService.delete(`/admin/content/${id}`);
    return response;
  },

  duplicateContent: async (id: string): Promise<ContentItem> => {
    const response = await apiService.post(`/admin/content/${id}/duplicate`);
    return response;
  },

  publishContent: async (id: string): Promise<ContentItem> => {
    const response = await apiService.post(`/admin/content/${id}/publish`);
    return response;
  },

  unpublishContent: async (id: string): Promise<ContentItem> => {
    const response = await apiService.post(`/admin/content/${id}/unpublish`);
    return response;
  },

  scheduleContent: async (id: string, scheduledFor: string): Promise<ContentSchedule> => {
    const response = await apiService.post(`/admin/content/${id}/schedule`, {
      scheduled_for: scheduledFor,
    });
    return response;
  },

  bulkContentOperation: async (operation: BulkContentOperation): Promise<any> => {
    const response = await apiService.post('/admin/content/bulk', operation);
    return response;
  },

  // Content preview and SEO
  previewContent: async (id: string): Promise<{ preview_url: string }> => {
    const response = await apiService.get(`/admin/content/${id}/preview`);
    return response;
  },

  analyzeSEO: async (id: string): Promise<SEOAnalysis> => {
    const response = await apiService.post(`/admin/content/${id}/seo-analysis`);
    return response;
  },

  generateSlug: async (title: string): Promise<{ slug: string }> => {
    const response = await apiService.post('/admin/content/generate-slug', { title });
    return response;
  },

  checkSlugAvailability: async (slug: string, excludeId?: string): Promise<{ available: boolean }> => {
    const response = await apiService.post('/admin/content/check-slug', { slug, exclude_id: excludeId });
    return response;
  },

  // Content analytics
  getContentAnalytics: async (id: string, period?: {
    start_date: string;
    end_date: string;
  }): Promise<ContentAnalytics> => {
    const response = await apiService.get(`/admin/content/${id}/analytics`, { params: period });
    return response;
  },

  getTopContent: async (params?: {
    period: 'day' | 'week' | 'month' | 'year';
    metric: 'views' | 'likes' | 'shares' | 'engagement';
    limit?: number;
  }): Promise<ContentItem[]> => {
    const response = await apiService.get('/admin/content/top', { params });
    return response;
  },

  getTrendingContent: async (limit = 10): Promise<ContentItem[]> => {
    const response = await apiService.get('/admin/content/trending', { params: { limit } });
    return response;
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
    const response = await apiService.get('/admin/content/categories', { params });
    return response;
  },

  getCategoryById: async (id: string): Promise<ContentCategory> => {
    const response = await apiService.get(`/admin/content/categories/${id}`);
    return response;
  },

  createCategory: async (data: Omit<ContentCategory, 'id' | 'content_count' | 'created_at' | 'updated_at'>): Promise<ContentCategory> => {
    const response = await apiService.post('/admin/content/categories', data);
    return response;
  },

  updateCategory: async (id: string, data: Partial<ContentCategory>): Promise<ContentCategory> => {
    const response = await apiService.put(`/admin/content/categories/${id}`, data);
    return response;
  },

  deleteCategory: async (id: string): Promise<any> => {
    const response = await apiService.delete(`/admin/content/categories/${id}`);
    return response;
  },

  reorderCategories: async (categories: Array<{ id: string; sort_order: number }>): Promise<any> => {
    const response = await apiService.post('/admin/content/categories/reorder', { categories });
    return response;
  },
};

// ==================== TAG OPERATIONS ====================

export const TagService = {
  getTags: async (params?: {
    search?: string;
    limit?: number;
    popular?: boolean;
  }): Promise<ContentTag[]> => {
    const response = await apiService.get('/admin/content/tags', { params });
    return response;
  },

  createTag: async (data: { name: string; description?: string; color?: string }): Promise<ContentTag> => {
    const response = await apiService.post('/admin/content/tags', data);
    return response;
  },

  updateTag: async (id: string, data: Partial<ContentTag>): Promise<ContentTag> => {
    const response = await apiService.put(`/admin/content/tags/${id}`, data);
    return response;
  },

  deleteTag: async (id: string): Promise<any> => {
    const response = await apiService.delete(`/admin/content/tags/${id}`);
    return response;
  },

  mergeTags: async (sourceTagId: string, targetTagId: string): Promise<any> => {
    const response = await apiService.post('/admin/content/tags/merge', {
      source_tag_id: sourceTagId,
      target_tag_id: targetTagId,
    });
    return response;
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
    const response = await apiService.get('/admin/media', { params });
    return response;
  },

  getMediaFile: async (id: string): Promise<MediaFile> => {
    const response = await apiService.get(`/admin/media/${id}`);
    return response;
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

    const response = await apiService.post('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  updateMedia: async (id: string, data: Partial<MediaFile>): Promise<MediaFile> => {
    const response = await apiService.put(`/admin/media/${id}`, data);
    return response;
  },

  deleteMedia: async (id: string): Promise<any> => {
    const response = await apiService.delete(`/admin/media/${id}`);
    return response;
  },

  bulkDeleteMedia: async (ids: string[]): Promise<any> => {
    const response = await apiService.post('/admin/media/bulk-delete', { ids });
    return response;
  },

  moveMedia: async (ids: string[], folderId?: string): Promise<any> => {
    const response = await apiService.post('/admin/media/move', { ids, folder_id: folderId });
    return response;
  },

  // Folder operations
  getFolders: async (): Promise<MediaFolder[]> => {
    const response = await apiService.get('/admin/media/folders');
    return response;
  },

  createFolder: async (data: { name: string; parent_id?: string; description?: string }): Promise<MediaFolder> => {
    const response = await apiService.post('/admin/media/folders', data);
    return response;
  },

  updateFolder: async (id: string, data: Partial<MediaFolder>): Promise<MediaFolder> => {
    const response = await apiService.put(`/admin/media/folders/${id}`, data);
    return response;
  },

  deleteFolder: async (id: string, moveContents?: boolean): Promise<any> => {
    const response = await apiService.delete(`/admin/media/folders/${id}`, {
      params: { move_contents: moveContents },
    });
    return response;
  },

  // Media optimization and processing
  optimizeImage: async (id: string): Promise<MediaFile> => {
    const response = await apiService.post(`/admin/media/${id}/optimize`);
    return response;
  },

  generateThumbnails: async (id: string, sizes: number[]): Promise<{ thumbnails: Record<string, string> }> => {
    const response = await apiService.post(`/admin/media/${id}/thumbnails`, { sizes });
    return response;
  },

  getMediaUsage: async (id: string): Promise<{ usage: Array<{ content_id: string; content_title: string; usage_type: string }> }> => {
    const response = await apiService.get(`/admin/media/${id}/usage`);
    return response;
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
    const response = await apiService.get('/admin/content/templates', { params });
    return response;
  },

  getTemplate: async (id: string): Promise<ContentTemplate> => {
    const response = await apiService.get(`/admin/content/templates/${id}`);
    return response;
  },

  createTemplate: async (data: CreateContentTemplateRequest): Promise<ContentTemplate> => {
    const response = await apiService.post('/admin/content/templates', data);
    return response;
  },

  updateTemplate: async (id: string, data: Partial<CreateContentTemplateRequest>): Promise<ContentTemplate> => {
    const response = await apiService.put(`/admin/content/templates/${id}`, data);
    return response;
  },

  deleteTemplate: async (id: string): Promise<any> => {
    const response = await apiService.delete(`/admin/content/templates/${id}`);
    return response;
  },

  duplicateTemplate: async (id: string): Promise<ContentTemplate> => {
    const response = await apiService.post(`/admin/content/templates/${id}/duplicate`);
    return response;
  },

  previewTemplate: async (id: string, sampleData?: Record<string, any>): Promise<{ preview_html: string }> => {
    const response = await apiService.post(`/admin/content/templates/${id}/preview`, { sample_data: sampleData });
    return response;
  },
};

// ==================== WORKFLOW OPERATIONS ====================

export const WorkflowService = {
  getWorkflows: async (): Promise<ContentWorkflow[]> => {
    const response = await apiService.get('/admin/content/workflows');
    return response;
  },

  getWorkflow: async (id: string): Promise<ContentWorkflow> => {
    const response = await apiService.get(`/admin/content/workflows/${id}`);
    return response;
  },

  createWorkflow: async (data: Omit<ContentWorkflow, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<ContentWorkflow> => {
    const response = await apiService.post('/admin/content/workflows', data);
    return response;
  },

  updateWorkflow: async (id: string, data: Partial<ContentWorkflow>): Promise<ContentWorkflow> => {
    const response = await apiService.put(`/admin/content/workflows/${id}`, data);
    return response;
  },

  deleteWorkflow: async (id: string): Promise<any> => {
    const response = await apiService.delete(`/admin/content/workflows/${id}`);
    return response;
  },

  // Review operations
  getPendingReviews: async (userId?: string): Promise<ContentReview[]> => {
    const response = await apiService.get('/admin/content/reviews/pending', {
      params: userId ? { user_id: userId } : undefined,
    });
    return response;
  },

  submitReview: async (data: {
    content_id: string;
    workflow_step_id: string;
    status: ContentReview['status'];
    comments?: string;
    changes_requested?: ContentReview['changes_requested'];
  }): Promise<ContentReview> => {
    const response = await apiService.post('/admin/content/reviews', data);
    return response;
  },

  getContentReviews: async (contentId: string): Promise<ContentReview[]> => {
    const response = await apiService.get(`/admin/content/${contentId}/reviews`);
    return response;
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
    const response = await apiService.get('/admin/content/schedule', { params });
    return response;
  },

  cancelSchedule: async (id: string): Promise<any> => {
    const response = await apiService.delete(`/admin/content/schedule/${id}`);
    return response;
  },

  updateSchedule: async (id: string, scheduledFor: string): Promise<ContentSchedule> => {
    const response = await apiService.put(`/admin/content/schedule/${id}`, {
      scheduled_for: scheduledFor,
    });
    return response;
  },

  executeScheduledAction: async (id: string): Promise<any> => {
    const response = await apiService.post(`/admin/content/schedule/${id}/execute`);
    return response;
  },
};
