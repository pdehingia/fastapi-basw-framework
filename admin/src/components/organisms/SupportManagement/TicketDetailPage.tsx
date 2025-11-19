/**
 * Support Ticket Detail Page
 * Comprehensive view for managing individual support tickets with full history
 */

import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/atoms';
import { Card, Modal, Heading } from '@/components/molecules';
import { 
  useSupportTicket, 
  useUpdateTicketStatus, 
  useUpdateTicketPriority, 
  useAssignTicket,
  useAddTicketComment,
  useEscalateTicket 
} from '@/hooks/api/useSupportTickets';
import { SupportTicket, SupportTicketComment, SupportAgent } from '@/types';
import { 
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperClipIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { toast } from '@/services/toast';

export const TicketDetailPage = () => {
  const { ticketId } = useParams({ from: '/support-tickets/$ticketId' });
  const navigate = useNavigate();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // API hooks
  const { data: ticket, isLoading, refetch } = useSupportTicket(ticketId);
  const updateStatusMutation = useUpdateTicketStatus();
  const updatePriorityMutation = useUpdateTicketPriority();
  const assignTicketMutation = useAssignTicket();
  const addCommentMutation = useAddTicketComment();
  const escalateMutation = useEscalateTicket();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Ticket not found</h3>
        <Button
          variant="primary"
          onClick={() => navigate({ to: '/support-tickets' })}
          className="mt-4"
        >
          Back to Tickets
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: SupportTicket['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ 
        ticketId: ticket.id, 
        status: newStatus,
        reason: `Status changed to ${newStatus}`
      });
      refetch();
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handlePriorityChange = async (newPriority: SupportTicket['priority']) => {
    try {
      await updatePriorityMutation.mutateAsync({ 
        ticketId: ticket.id, 
        priority: newPriority,
        reason: `Priority changed to ${newPriority}`
      });
      refetch();
      toast.success(`Ticket priority updated to ${newPriority}`);
    } catch (error) {
      console.error('Error updating ticket priority:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addCommentMutation.mutateAsync({
        ticketId: ticket.id,
        content: newComment,
        isInternal,
        author: 'Current Admin User' // This should come from auth context
      });
      setNewComment('');
      setIsInternal(false);
      setShowCommentModal(false);
      refetch();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEscalate = async (reason: string) => {
    try {
      await escalateMutation.mutateAsync({
        ticketId: ticket.id,
        reason,
        escalatedTo: 'senior-support' // This should come from form
      });
      setShowEscalateModal(false);
      refetch();
      toast.success('Ticket escalated successfully');
    } catch (error) {
      console.error('Error escalating ticket:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/support-tickets' })}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <Heading size="large" className="text-gray-900">
              Ticket #{ticket.id.slice(-8)}
            </Heading>
            <p className="text-gray-600 mt-1">{ticket.subject}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority.toUpperCase()}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer</dt>
                  <dd className="text-sm text-gray-900 mt-1">Customer #{ticket.customer_id.slice(-6)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900 mt-1">{new Date(ticket.created_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="text-sm text-gray-900 mt-1">{ticket.category || 'General'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900 mt-1">{new Date(ticket.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
              
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Initial Message */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Original Message</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700">{ticket.description}</p>
              </div>
            </div>
          </Card>

          {/* Comments/History */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Comments & History</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCommentModal(true)}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
              
              <div className="space-y-4">
                {ticket.comments?.map((comment: SupportTicketComment, index) => (
                  <div key={index} className={`border-l-4 pl-4 py-3 ${comment.isInternal ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                        {comment.isInternal && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Internal
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
                
                {(!ticket.comments || ticket.comments.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No comments yet</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as SupportTicket['status'])}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as SupportTicket['priority'])}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAssignModal(true)}
                    className="w-full justify-center"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Reassign
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowEscalateModal(true)}
                    className="w-full justify-center"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Assigned Agent */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Agent</h3>
              {ticket.assigned_to ? (
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Agent #{ticket.assigned_to.slice(-6)}</p>
                    <p className="text-xs text-gray-500">Support Agent</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Not assigned</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAssignModal(true)}
                    className="mt-2"
                  >
                    Assign Agent
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Ticket Statistics */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Response Time</dt>
                  <dd className="text-sm text-gray-900">
                    {ticket.response_time ? `${ticket.response_time} minutes` : 'Not yet responded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Resolution Time</dt>
                  <dd className="text-sm text-gray-900">
                    {ticket.resolution_time ? `${ticket.resolution_time} hours` : 'Not yet resolved'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Comments</dt>
                  <dd className="text-sm text-gray-900">{ticket.comments?.length || 0}</dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Comment Modal */}
      {showCommentModal && (
        <Modal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          title="Add Comment"
          size="large"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                id="comment"
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter your comment..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="internal"
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="internal" className="ml-2 block text-sm text-gray-900">
                Internal comment (not visible to customer)
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddComment}
                isLoading={addCommentMutation.isPending}
              >
                Add Comment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <Modal
          isOpen={showEscalateModal}
          onClose={() => setShowEscalateModal(false)}
          title="Escalate Ticket"
          size="medium"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="escalate-reason" className="block text-sm font-medium text-gray-700">
                Escalation Reason
              </label>
              <textarea
                id="escalate-reason"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Explain why this ticket needs to be escalated..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleEscalate('Manual escalation from admin')}
                isLoading={escalateMutation.isPending}
              >
                Escalate Ticket
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};