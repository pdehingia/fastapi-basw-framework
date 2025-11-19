/**
 * Support Ticket API Service
 * Handles all API calls related to support ticket management
 */

import { apiClient } from './client';
import { SUPPORT_ENDPOINTS } from '@/config/api';
import type { 
  SupportTicket, 
  SupportTicketFilters, 
  CreateSupportTicketRequest,
  UpdateSupportTicketRequest,
  SupportTicketComment,
  CreateCommentRequest,
  PaginatedResponse,
  ApiResponse
} from '@/types/api.types';

/**
 * Support Ticket Service Class
 */
export class SupportTicketService {
  /**
   * Get paginated list of support tickets
   */
  async getSupportTickets(filters: SupportTicketFilters = {}): Promise<ApiResponse<PaginatedResponse<SupportTicket>>> {
    const params = new URLSearchParams();
    
    // Add filters to query params
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.assigned_agent_id) params.append('assigned_agent_id', filters.assigned_agent_id);
    if (filters.created_after) params.append('created_after', filters.created_after);
    if (filters.created_before) params.append('created_before', filters.created_before);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

    const queryParams = Object.fromEntries(params);
    return apiClient.get(SUPPORT_ENDPOINTS.TICKETS, { params: queryParams });
  }

  /**
   * Get specific support ticket by ID
   */
  async getSupportTicket(ticketId: string): Promise<ApiResponse<SupportTicket>> {
    return apiClient.get(SUPPORT_ENDPOINTS.GET_TICKET(ticketId));
  }

  /**
   * Create new support ticket
   */
  async createSupportTicket(ticketData: CreateSupportTicketRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.post(SUPPORT_ENDPOINTS.TICKETS, ticketData);
  }

  /**
   * Update existing support ticket
   */
  async updateSupportTicket(ticketId: string, updates: UpdateSupportTicketRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.patch(SUPPORT_ENDPOINTS.UPDATE_TICKET(ticketId), updates);
  }

  /**
   * Delete support ticket
   */
  async deleteSupportTicket(ticketId: string): Promise<void> {
    await apiClient.delete(SUPPORT_ENDPOINTS.UPDATE_TICKET(ticketId));
  }

  /**
   * Get comments for a specific ticket
   */
  async getTicketComments(ticketId: string): Promise<ApiResponse<SupportTicketComment[]>> {
    return apiClient.get(`${SUPPORT_ENDPOINTS.GET_TICKET(ticketId)}/comments`);
  }

  /**
   * Add comment to support ticket
   */
  async addTicketComment(ticketId: string, commentData: CreateCommentRequest): Promise<ApiResponse<SupportTicketComment>> {
    return apiClient.post(`${SUPPORT_ENDPOINTS.GET_TICKET(ticketId)}/comments`, commentData);
  }

  /**
   * Assign ticket to agent
   */
  async assignTicket(ticketId: string, agentId: string, notes?: string): Promise<ApiResponse<SupportTicket>> {
    return apiClient.post(`${SUPPORT_ENDPOINTS.GET_TICKET(ticketId)}/assign`, {
      agent_id: agentId,
      notes
    });
  }

  /**
   * Escalate support ticket
   */
  async escalateTicket(ticketId: string, escalationLevel: string, reason: string): Promise<ApiResponse<SupportTicket>> {
    return apiClient.post(`${SUPPORT_ENDPOINTS.GET_TICKET(ticketId)}/escalate`, {
      escalation_level: escalationLevel,
      reason
    });
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportTicket['status'], resolution?: string): Promise<ApiResponse<SupportTicket>> {
    return this.updateSupportTicket(ticketId, { 
      status,
      resolution,
      resolved_at: status === 'resolved' ? new Date().toISOString() : undefined
    });
  }

  /**
   * Update ticket priority
   */
  async updateTicketPriority(ticketId: string, priority: SupportTicket['priority'], reason?: string): Promise<ApiResponse<SupportTicket>> {
    return this.updateSupportTicket(ticketId, { 
      priority,
      priority_change_reason: reason
    });
  }

  /**
   * Bulk update multiple tickets
   */
  async bulkUpdateTickets(ticketIds: string[], updates: Partial<UpdateSupportTicketRequest>): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    return apiClient.post(`${SUPPORT_ENDPOINTS.TICKETS}/bulk`, {
      ticket_ids: ticketIds,
      updates
    });
  }

  /**
   * Get support ticket statistics
   */
  async getTicketStats(dateRange?: { start_date: string; end_date: string }): Promise<ApiResponse<{
    total_tickets: number;
    open_tickets: number;
    resolved_tickets: number;
    avg_resolution_time: number;
    tickets_by_priority: Record<string, number>;
    tickets_by_category: Record<string, number>;
    agent_performance: Array<{
      agent_id: string;
      agent_name: string;
      assigned_tickets: number;
      resolved_tickets: number;
      avg_resolution_time: number;
    }>;
  }>> {
    const params = dateRange ? { params: dateRange } : {};
    return apiClient.get(`${SUPPORT_ENDPOINTS.TICKETS}/stats`, params);
  }

  /**
   * Get list of available support agents
   */
  async getSupportAgents(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    email: string;
    department: string;
    active_tickets: number;
    max_tickets: number;
    status: 'available' | 'busy' | 'offline';
  }>>> {
    return apiClient.get(`${SUPPORT_ENDPOINTS.TICKETS}/agents`);
  }

  /**
   * Get list of support categories
   */
  async getSupportCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    default_priority: string;
    auto_assign_rules: any[];
  }>>> {
    return apiClient.get(`${SUPPORT_ENDPOINTS.TICKETS}/categories`);
  }

  /**
   * Search tickets with advanced filters
   */
  async searchTickets(query: string, filters?: Partial<SupportTicketFilters>): Promise<ApiResponse<PaginatedResponse<SupportTicket>>> {
    return this.getSupportTickets({
      ...filters,
      search: query
    });
  }

  /**
   * Get ticket resolution metrics
   */
  async getResolutionMetrics(timeframe: '24h' | '7d' | '30d' | '90d'): Promise<ApiResponse<{
    avg_first_response_time: number;
    avg_resolution_time: number;
    resolution_rate: number;
    customer_satisfaction: number;
    escalation_rate: number;
  }>> {
    return apiClient.get(`${SUPPORT_ENDPOINTS.TICKETS}/metrics`, { 
      params: { timeframe }
    });
  }
}

// Export singleton instance
export const supportTicketService = new SupportTicketService();