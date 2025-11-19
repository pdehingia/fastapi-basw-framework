import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from '@/services/toast';
import {
  ContentService,
  CategoryService,
  TagService,
  MediaService,
  TemplateService,
  WorkflowService,
  ScheduleService,
} from '@/services/api/content';
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
  CreateContentRequest,
  UpdateContentRequest,
  CreateMediaRequest,
  CreateContentTemplateRequest,
  BulkContentOperation,
} from '@/types/api.types';

// ==================== CONTENT HOOKS ====================

export const useContent = (params?: Parameters<typeof ContentService.getContent>[0]) => {
  return useQuery({
    queryKey: ['content', params],
    queryFn: () => ContentService.getContent(params),
    staleTime: 30000,
  });
};

export const useInfiniteContent = (params?: Parameters<typeof ContentService.getContent>[0]) => {
  return useInfiniteQuery({
    queryKey: ['content', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      ContentService.getContent({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    staleTime: 30000,
  });
};

export const useContentItem = (id: string) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => ContentService.getContentById(id),
    enabled: !!id,
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateContentRequest) => ContentService.createContent(data),
    onSuccess: (newContent) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.setQueryData(['content', newContent.id], newContent);
      toast.success('Content created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create content');
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateContentRequest) => ContentService.updateContent(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['content', data.id] });
      const previousContent = queryClient.getQueryData(['content', data.id]);
      
      queryClient.setQueryData(['content', data.id], (old: ContentItem | undefined) => 
        old ? { ...old, ...data } : undefined
      );
      
      return { previousContent };
    },
    onSuccess: (updatedContent) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.setQueryData(['content', updatedContent.id], updatedContent);
      toast.success('Content updated successfully');
    },
    onError: (error: any, variables, context) => {
      if (context?.previousContent) {
        queryClient.setQueryData(['content', variables.id], context.previousContent);
      }
      toast.error(error?.message || 'Failed to update content');
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ContentService.deleteContent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.removeQueries({ queryKey: ['content', id] });
      toast.success('Content deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete content');
    },
  });
};

export const useDuplicateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ContentService.duplicateContent(id),
    onSuccess: (duplicatedContent) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.setQueryData(['content', duplicatedContent.id], duplicatedContent);
      toast.success('Content duplicated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to duplicate content');
    },
  });
};

export const usePublishContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ContentService.publishContent(id),
    onSuccess: (updatedContent) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.setQueryData(['content', updatedContent.id], updatedContent);
      toast.success('Content published successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to publish content');
    },
  });
};

export const useUnpublishContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ContentService.unpublishContent(id),
    onSuccess: (updatedContent) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.setQueryData(['content', updatedContent.id], updatedContent);
      toast.success('Content unpublished successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to unpublish content');
    },
  });
};

export const useScheduleContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      ContentService.scheduleContent(id, scheduledFor),
    onSuccess: (schedule) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content-schedule'] });
      toast.success('Content scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to schedule content');
    },
  });
};

export const useBulkContentOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: BulkContentOperation) => ContentService.bulkContentOperation(operation),
    onSuccess: (_, operation) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      const actionNames: Record<string, string> = {
        publish: 'published',
        unpublish: 'unpublished',
        delete: 'deleted',
        update_category: 'updated',
        update_tags: 'updated',
      };
      toast.success(`${operation.content_ids.length} items ${actionNames[operation.action]} successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to perform bulk operation');
    },
  });
};

export const useContentPreview = (id: string) => {
  return useQuery({
    queryKey: ['content-preview', id],
    queryFn: () => ContentService.previewContent(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useSEOAnalysis = () => {
  return useMutation({
    mutationFn: (id: string) => ContentService.analyzeSEO(id),
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to analyze SEO');
    },
  });
};

export const useGenerateSlug = () => {
  return useMutation({
    mutationFn: (title: string) => ContentService.generateSlug(title),
  });
};

export const useCheckSlugAvailability = () => {
  return useMutation({
    mutationFn: ({ slug, excludeId }: { slug: string; excludeId?: string }) =>
      ContentService.checkSlugAvailability(slug, excludeId),
  });
};

export const useContentAnalytics = (id: string, period?: { start_date: string; end_date: string }) => {
  return useQuery({
    queryKey: ['content-analytics', id, period],
    queryFn: () => ContentService.getContentAnalytics(id, period),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

export const useTopContent = (params?: Parameters<typeof ContentService.getTopContent>[0]) => {
  return useQuery({
    queryKey: ['content-top', params],
    queryFn: () => ContentService.getTopContent(params),
    staleTime: 300000,
  });
};

export const useTrendingContent = (limit = 10) => {
  return useQuery({
    queryKey: ['content-trending', limit],
    queryFn: () => ContentService.getTrendingContent(limit),
    staleTime: 300000,
  });
};

// ==================== CATEGORY HOOKS ====================

export const useCategories = (params?: Parameters<typeof CategoryService.getCategories>[0]) => {
  return useQuery({
    queryKey: ['content-categories', params],
    queryFn: () => CategoryService.getCategories(params),
    staleTime: 300000,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['content-categories', id],
    queryFn: () => CategoryService.getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof CategoryService.createCategory>[0]) =>
      CategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentCategory> }) =>
      CategoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: ['content-categories'] });
      queryClient.setQueryData(['content-categories', updatedCategory.id], updatedCategory);
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content-categories'] });
      queryClient.removeQueries({ queryKey: ['content-categories', id] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete category');
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categories: Array<{ id: string; sort_order: number }>) =>
      CategoryService.reorderCategories(categories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-categories'] });
      toast.success('Categories reordered successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to reorder categories');
    },
  });
};

// ==================== TAG HOOKS ====================

export const useTags = (params?: Parameters<typeof TagService.getTags>[0]) => {
  return useQuery({
    queryKey: ['content-tags', params],
    queryFn: () => TagService.getTags(params),
    staleTime: 300000,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string }) =>
      TagService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      toast.success('Tag created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create tag');
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentTag> }) =>
      TagService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      toast.success('Tag updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update tag');
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => TagService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete tag');
    },
  });
};

export const useMergeTags = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sourceTagId, targetTagId }: { sourceTagId: string; targetTagId: string }) =>
      TagService.mergeTags(sourceTagId, targetTagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      toast.success('Tags merged successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to merge tags');
    },
  });
};

// ==================== MEDIA HOOKS ====================

export const useMediaFiles = (params?: Parameters<typeof MediaService.getMediaFiles>[0]) => {
  return useQuery({
    queryKey: ['media', params],
    queryFn: () => MediaService.getMediaFiles(params),
    staleTime: 30000,
  });
};

export const useInfiniteMedia = (params?: Parameters<typeof MediaService.getMediaFiles>[0]) => {
  return useInfiniteQuery({
    queryKey: ['media', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      MediaService.getMediaFiles({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    staleTime: 30000,
  });
};

export const useMediaFile = (id: string) => {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => MediaService.getMediaFile(id),
    enabled: !!id,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMediaRequest) => MediaService.uploadMedia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload file');
    },
  });
};

export const useUpdateMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MediaFile> }) =>
      MediaService.updateMedia(id, data),
    onSuccess: (updatedMedia) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.setQueryData(['media', updatedMedia.id], updatedMedia);
      toast.success('Media updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update media');
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => MediaService.deleteMedia(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.removeQueries({ queryKey: ['media', id] });
      toast.success('Media deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete media');
    },
  });
};

export const useBulkDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => MediaService.bulkDeleteMedia(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      ids.forEach(id => queryClient.removeQueries({ queryKey: ['media', id] }));
      toast.success(`${ids.length} files deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete files');
    },
  });
};

export const useMoveMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, folderId }: { ids: string[]; folderId?: string }) =>
      MediaService.moveMedia(ids, folderId),
    onSuccess: (_, { ids, folderId }) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      const action = folderId ? 'moved to folder' : 'moved to root';
      toast.success(`${ids.length} files ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to move files');
    },
  });
};

export const useMediaFolders = () => {
  return useQuery({
    queryKey: ['media-folders'],
    queryFn: () => MediaService.getFolders(),
    staleTime: 300000,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; parent_id?: string; description?: string }) =>
      MediaService.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      toast.success('Folder created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create folder');
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MediaFolder> }) =>
      MediaService.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      toast.success('Folder updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update folder');
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, moveContents }: { id: string; moveContents?: boolean }) =>
      MediaService.deleteFolder(id, moveContents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Folder deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete folder');
    },
  });
};

export const useOptimizeImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => MediaService.optimizeImage(id),
    onSuccess: (optimizedMedia) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.setQueryData(['media', optimizedMedia.id], optimizedMedia);
      toast.success('Image optimized successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to optimize image');
    },
  });
};

export const useGenerateThumbnails = () => {
  return useMutation({
    mutationFn: ({ id, sizes }: { id: string; sizes: number[] }) =>
      MediaService.generateThumbnails(id, sizes),
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to generate thumbnails');
    },
  });
};

export const useMediaUsage = (id: string) => {
  return useQuery({
    queryKey: ['media-usage', id],
    queryFn: () => MediaService.getMediaUsage(id),
    enabled: !!id,
  });
};

// ==================== TEMPLATE HOOKS ====================

export const useContentTemplates = (params?: Parameters<typeof TemplateService.getTemplates>[0]) => {
  return useQuery({
    queryKey: ['content-templates', params],
    queryFn: () => TemplateService.getTemplates(params),
    staleTime: 300000,
  });
};

export const useContentTemplate = (id: string) => {
  return useQuery({
    queryKey: ['content-templates', id],
    queryFn: () => TemplateService.getTemplate(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateContentTemplateRequest) => TemplateService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create template');
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateContentTemplateRequest> }) =>
      TemplateService.updateTemplate(id, data),
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
      queryClient.setQueryData(['content-templates', updatedTemplate.id], updatedTemplate);
      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update template');
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => TemplateService.deleteTemplate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
      queryClient.removeQueries({ queryKey: ['content-templates', id] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete template');
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => TemplateService.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
      toast.success('Template duplicated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to duplicate template');
    },
  });
};

export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({ id, sampleData }: { id: string; sampleData?: Record<string, any> }) =>
      TemplateService.previewTemplate(id, sampleData),
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to preview template');
    },
  });
};

// ==================== WORKFLOW HOOKS ====================

export const useContentWorkflows = () => {
  return useQuery({
    queryKey: ['content-workflows'],
    queryFn: () => WorkflowService.getWorkflows(),
    staleTime: 300000,
  });
};

export const useContentWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['content-workflows', id],
    queryFn: () => WorkflowService.getWorkflow(id),
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof WorkflowService.createWorkflow>[0]) =>
      WorkflowService.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-workflows'] });
      toast.success('Workflow created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create workflow');
    },
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentWorkflow> }) =>
      WorkflowService.updateWorkflow(id, data),
    onSuccess: (updatedWorkflow) => {
      queryClient.invalidateQueries({ queryKey: ['content-workflows'] });
      queryClient.setQueryData(['content-workflows', updatedWorkflow.id], updatedWorkflow);
      toast.success('Workflow updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update workflow');
    },
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => WorkflowService.deleteWorkflow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content-workflows'] });
      queryClient.removeQueries({ queryKey: ['content-workflows', id] });
      toast.success('Workflow deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete workflow');
    },
  });
};

export const usePendingReviews = (userId?: string) => {
  return useQuery({
    queryKey: ['content-reviews', 'pending', userId],
    queryFn: () => WorkflowService.getPendingReviews(userId),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof WorkflowService.submitReview>[0]) =>
      WorkflowService.submitReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Review submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit review');
    },
  });
};

export const useContentReviews = (contentId: string) => {
  return useQuery({
    queryKey: ['content-reviews', contentId],
    queryFn: () => WorkflowService.getContentReviews(contentId),
    enabled: !!contentId,
  });
};

// ==================== SCHEDULE HOOKS ====================

export const useScheduledContent = (params?: Parameters<typeof ScheduleService.getScheduledContent>[0]) => {
  return useQuery({
    queryKey: ['content-schedule', params],
    queryFn: () => ScheduleService.getScheduledContent(params),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useCancelSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ScheduleService.cancelSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-schedule'] });
      toast.success('Schedule cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel schedule');
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      ScheduleService.updateSchedule(id, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-schedule'] });
      toast.success('Schedule updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update schedule');
    },
  });
};

export const useExecuteScheduledAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ScheduleService.executeScheduledAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Scheduled action executed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to execute scheduled action');
    },
  });
};