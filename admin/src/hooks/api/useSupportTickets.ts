/**
 * Support Ticket API Hooks
 * TanStack Query hooks for support ticket management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportTicketService } from '@/services/api';
import ToastService from '@/services/toast';
import type { 
  SupportTicket, 
  SupportTicketFilters, 
  CreateSupportTicketRequest,
  UpdateSupportTicketRequest,
  CreateCommentRequest
} from '@/types/api.types';

// Query Keys
const SUPPORT_QUERY_KEYS = {
  supportTickets: 'supportTickets',
  supportTicket: (id: string) => ['supportTickets', id],
  ticketComments: (id: string) => ['supportTickets', id, 'comments'],
  agents: 'supportAgents',
  categories: 'supportCategories',
  stats: 'supportStats',
  metrics: (timeframe: string) => ['supportMetrics', timeframe],
} as const;

/**
 * Get paginated support tickets
 */
export const useSupportTickets = (filters: SupportTicketFilters = {}) => {
  return useQuery({
    queryKey: [SUPPORT_QUERY_KEYS.supportTickets, filters],
    queryFn: () => supportTicketService.getSupportTickets(filters),
    select: (data) => data.data,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get single support ticket by ID
 */
export const useSupportTicket = (ticketId: string) => {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.supportTicket(ticketId),
    queryFn: () => supportTicketService.getSupportTicket(ticketId),
    select: (data) => data.data,
    enabled: !!ticketId,
  });
};

/**
 * Get ticket comments
 */
export const useTicketComments = (ticketId: string) => {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.ticketComments(ticketId),
    queryFn: () => supportTicketService.getTicketComments(ticketId),
    select: (data) => data.data,
    enabled: !!ticketId,
  });
};

/**
 * Get support agents
 */
export const useSupportAgents = () => {
  return useQuery({
    queryKey: [SUPPORT_QUERY_KEYS.agents],
    queryFn: () => supportTicketService.getSupportAgents(),
    select: (data) => data.data,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get support categories
 */
export const useSupportCategories = () => {
  return useQuery({
    queryKey: [SUPPORT_QUERY_KEYS.categories],
    queryFn: () => supportTicketService.getSupportCategories(),
    select: (data) => data.data,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get support ticket statistics
 */
export const useSupportStats = (dateRange?: { start_date: string; end_date: string }) => {
  return useQuery({
    queryKey: [SUPPORT_QUERY_KEYS.stats, dateRange],
    queryFn: () => supportTicketService.getTicketStats(dateRange),
    select: (data) => data.data,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Get resolution metrics
 */
export const useResolutionMetrics = (timeframe: '24h' | '7d' | '30d' | '90d') => {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.metrics(timeframe),
    queryFn: () => supportTicketService.getResolutionMetrics(timeframe),
    select: (data) => data.data,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Create support ticket mutation
 */
export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupportTicketRequest) => 
      supportTicketService.createSupportTicket(data),
    onSuccess: () => {
      ToastService.success('Support ticket created successfully');
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.stats] });
    },
    onError: () => {
      ToastService.error('Failed to create support ticket');
    },
  });
};

/**
 * Update support ticket mutation
 */
export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateSupportTicketRequest }) =>
      supportTicketService.updateSupportTicket(id, updates),
    onSuccess: (_, variables) => {
      ToastService.success('Ticket updated successfully');
      // Invalidate specific ticket
      queryClient.invalidateQueries({ 
        queryKey: SUPPORT_QUERY_KEYS.supportTicket(variables.id) 
      });
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.stats] });
    },
    onError: () => {
      ToastService.error('Failed to update ticket');
    },
  });
};

/**
 * Delete support ticket mutation
 */
export const useDeleteSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => 
      supportTicketService.deleteSupportTicket(ticketId),
    onSuccess: (_, ticketId) => {
      ToastService.success('Ticket deleted successfully');
      // Remove from cache
      queryClient.removeQueries({ queryKey: SUPPORT_QUERY_KEYS.supportTicket(ticketId) });
      queryClient.removeQueries({ queryKey: SUPPORT_QUERY_KEYS.ticketComments(ticketId) });
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.stats] });
    },
    onError: () => {
      ToastService.error('Failed to delete ticket');
    },
  });
};

/**
 * Add ticket comment mutation
 */
export const useAddTicketComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, comment }: { ticketId: string; comment: CreateCommentRequest }) =>
      supportTicketService.addTicketComment(ticketId, comment),
    onSuccess: (_, variables) => {
      ToastService.success('Comment added successfully');
      // Invalidate ticket comments
      queryClient.invalidateQueries({ 
        queryKey: SUPPORT_QUERY_KEYS.ticketComments(variables.ticketId) 
      });
      // Invalidate specific ticket (to update last activity)
      queryClient.invalidateQueries({ 
        queryKey: SUPPORT_QUERY_KEYS.supportTicket(variables.ticketId) 
      });
    },
    onError: () => {
      ToastService.error('Failed to add comment');
    },
  });
};

/**
 * Assign ticket mutation
 */
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, agentId, notes }: { 
      ticketId: string; 
      agentId: string; 
      notes?: string; 
    }) => supportTicketService.assignTicket(ticketId, agentId, notes),
    onSuccess: (_, variables) => {
      ToastService.success('Ticket assigned successfully');
      // Invalidate specific ticket
      queryClient.invalidateQueries({ 
        queryKey: SUPPORT_QUERY_KEYS.supportTicket(variables.ticketId) 
      });
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.stats] });
    },
    onError: () => {
      ToastService.error('Failed to assign ticket');
    },
  });
};

/**
 * Escalate ticket mutation
 */
export const useEscalateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, escalationLevel, reason }: { 
      ticketId: string; 
      escalationLevel: string; 
      reason: string; 
    }) => supportTicketService.escalateTicket(ticketId, escalationLevel, reason),
    onSuccess: (_, variables) => {
      ToastService.success('Ticket escalated successfully');
      // Invalidate specific ticket
      queryClient.invalidateQueries({ 
        queryKey: SUPPORT_QUERY_KEYS.supportTicket(variables.ticketId) 
      });
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
    },
    onError: () => {
      ToastService.error('Failed to escalate ticket');
    },
  });
};

/**
 * Update ticket status mutation
 */
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status, resolution }: { 
      ticketId: string; 
      status: SupportTicket['status']; 
      resolution?: string; 
    }) => supportTicketService.updateTicketStatus(ticketId, status, resolution),
    onSuccess: (_, variables) => {
      ToastService.success('Ticket status updated successfully');
      // Invalidate specific ticket
      queryClient.invalidateQueries({ 
        queryKey: SUPPORT_QUERY_KEYS.supportTicket(variables.ticketId) 
      });
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.stats] });
    },
    onError: () => {
      ToastService.error('Failed to update ticket status');
    },
  });
};

/**
 * Update ticket priority mutation
 */
export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, priority, reason }: { 
      ticketId: string; 
      priority: SupportTicket['priority']; 
      reason?: string; 
    }) => supportTicketService.updateTicketPriority(ticketId, priority, reason),
    onSuccess: (_, variables) => {
      ToastService.success('Ticket priority updated successfully');
      // Invalidate specific ticket
      queryClient.invalidateQueries({ 
        queryKey: SUPPORT_QUERY_KEYS.supportTicket(variables.ticketId) 
      });
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
    },
    onError: () => {
      ToastService.error('Failed to update ticket priority');
    },
  });
};

/**
 * Bulk update tickets mutation
 */
export const useBulkUpdateTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketIds, updates }: { 
      ticketIds: string[]; 
      updates: Partial<UpdateSupportTicketRequest>; 
    }) => supportTicketService.bulkUpdateTickets(ticketIds, updates),
    onSuccess: (response) => {
      ToastService.success(`${response.data.updated} tickets updated successfully`);
      // Invalidate all tickets queries
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.supportTickets] });
      queryClient.invalidateQueries({ queryKey: [SUPPORT_QUERY_KEYS.stats] });
      
      // Show warning for failed updates
      if (response.data.failed.length > 0) {
        ToastService.warning(`${response.data.failed.length} tickets failed to update`);
      }
    },
    onError: () => {
      ToastService.error('Failed to update tickets');
    },
  });
};