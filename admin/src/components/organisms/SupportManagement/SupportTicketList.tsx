/**
 * Support Ticket List Page
 * Main interface for managing support tickets with comprehensive filtering and actions
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/templates';
import { DataTable } from '@/components/organisms/DataTable';
import { Button } from '@/components/atoms';
import { Modal, SearchBox } from '@/components/molecules';
// import { CreateTicketModal } from './CreateTicketModal';
// import { TicketAssignment } from './TicketAssignment';
import { 
  useSupportTickets, 
  useDeleteSupportTicket, 
  useUpdateTicketStatus,
  useUpdateTicketPriority,
  useBulkUpdateTickets,
  useSupportAgents,
  useSupportCategories 
} from '@/hooks/api/useSupportTickets';
import ToastService from '@/services/toast';
import { 
  PlusIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EyeIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import type { SupportTicket, SupportTicketFilters } from '@/types/api.types';

export const SupportTicketList = () => {
  const [filters, setFilters] = useState<SupportTicketFilters>({
    page: 1,
    limit: 20
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // API hooks
  const { data: ticketsData, isLoading, refetch } = useSupportTickets(filters);
  const { data: agents } = useSupportAgents();
  const { data: categories } = useSupportCategories();
  const deleteTicketMutation = useDeleteSupportTicket();
  const updateStatusMutation = useUpdateTicketStatus();
  const updatePriorityMutation = useUpdateTicketPriority();
  const bulkUpdateMutation = useBulkUpdateTickets();

  const tickets = ticketsData?.items || [];

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<SupportTicketFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    
    try {
      await deleteTicketMutation.mutateAsync(ticketToDelete.id);
      setShowDeleteModal(false);
      setTicketToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const handleStatusChange = async (ticket: SupportTicket, newStatus: SupportTicket['status']) => {
    try {
      await updateStatusMutation.mutateAsync({
        ticketId: ticket.id,
        status: newStatus
      });
      refetch();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handlePriorityChange = async (ticket: SupportTicket, newPriority: SupportTicket['priority']) => {
    try {
      await updatePriorityMutation.mutateAsync({
        ticketId: ticket.id,
        priority: newPriority
      });
      refetch();
    } catch (error) {
      console.error('Error updating ticket priority:', error);
    }
  };

  const handleBulkStatusUpdate = async (status: SupportTicket['status']) => {
    if (selectedTickets.length === 0) {
      ToastService.warning('Please select tickets to update');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        ticketIds: selectedTickets,
        updates: { status }
      });
      setSelectedTickets([]);
      refetch();
    } catch (error) {
      console.error('Error bulk updating tickets:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <ClockIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedTickets.length === tickets.length && tickets.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTickets(tickets.map(t => t.id));
            } else {
              setSelectedTickets([]);
            }
          }}
          className="rounded border-gray-300"
        />
      ) as any,
      render: (_: any, ticket: SupportTicket) => (
        <input
          type="checkbox"
          checked={selectedTickets.includes(ticket.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTickets([...selectedTickets, ticket.id]);
            } else {
              setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
            }
          }}
          className="rounded border-gray-300"
        />
      )
    },
    {
      key: 'ticket',
      header: 'Ticket',
      sortable: true,
      render: (_: any, ticket: SupportTicket) => (
        <div>
          <div className="font-medium text-gray-900">#{ticket.id.slice(-8)}</div>
          <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
            {ticket.subject}
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (_: any, ticket: SupportTicket) => (
        <div className="flex items-center">
          {getPriorityIcon(ticket.priority)}
          <select
            value={ticket.priority}
            onChange={(e) => handlePriorityChange(ticket, e.target.value as SupportTicket['priority'])}
            className={`ml-2 text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getPriorityColor(ticket.priority)}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, ticket: SupportTicket) => (
        <div className="flex items-center">
          {getStatusIcon(ticket.status)}
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(ticket, e.target.value as SupportTicket['status'])}
            className={`ml-2 text-xs px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(ticket.status)}`}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      )
    },
    {
      key: 'assigned_to',
      header: 'Assigned Agent',
      render: (_: any, ticket: SupportTicket) => {
        const agent = agents?.find(a => a.id === ticket.assigned_to);
        return (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
            {agent ? (
              <span className="text-sm text-gray-900">{agent.name}</span>
            ) : (
              <span className="text-sm text-gray-500 italic">Unassigned</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (_: any, ticket: SupportTicket) => (
        <div className="text-sm text-gray-900">
          Customer #{ticket.customer_id.slice(-6)}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (_: any, ticket: SupportTicket) => (
        <div className="text-sm text-gray-600">
          {new Date(ticket.created_at).toLocaleDateString()}
          <br />
          <span className="text-xs text-gray-500">
            {new Date(ticket.created_at).toLocaleTimeString()}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, ticket: SupportTicket) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/support-tickets/${ticket.id}`, '_blank')}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              setTicketToDelete(ticket);
              setShowDeleteModal(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout
      navigationProps={{
        title: 'Support Tickets',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: '/dashboard' },
          { id: 'support', label: 'Support', current: true },
        ],
        actions: [
          {
            id: 'create-ticket',
            label: 'Create Ticket',
            icon: 'PlusIcon',
            variant: 'primary',
            onClick: () => setShowCreateModal(true),
          },
        ],
      }}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600">Manage customer support tickets and inquiries</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowAssignModal(true)}
              disabled={selectedTickets.length === 0}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Assign Selected ({selectedTickets.length})
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Ticket
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedTickets.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('in_progress')}
                >
                  Mark In Progress
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('resolved')}
                >
                  Mark Resolved
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedTickets([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <SearchBox
                placeholder="Search tickets..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleFilterChange({ 
                  status: e.target.value ? e.target.value as SupportTicket['status'] : undefined 
                })}
                value={filters.status || ''}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleFilterChange({ 
                  priority: e.target.value ? e.target.value as SupportTicket['priority'] : undefined 
                })}
                value={filters.priority || ''}
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                value={filters.category || ''}
              >
                <option value="">All Categories</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <DataTable
            data={tickets}
            columns={columns}
            loading={isLoading}
            pagination={{
              currentPage: page,
              totalPages: Math.ceil((ticketsData?.metadata?.total_items ?? 0) / pageSize),
              totalItems: ticketsData?.metadata?.total_items ?? 0,
              pageSize: pageSize,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            sorting={{
              sortBy: sortBy || undefined,
              sortOrder: sortOrder,
              onSort: (key: string) => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(key);
                  setSortOrder('asc');
                }
              }
            }}
          />
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Ticket"
          size="medium"
        >
          <div className="space-y-4">
            <p>Create ticket functionality will be implemented.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowCreateModal(false)}>
                Create
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Ticket Assignment Modal */}
      {showAssignModal && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign Tickets"
          size="medium"
        >
          <div className="space-y-4">
            <p>Ticket assignment functionality will be implemented.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowAssignModal(false)}>
                Assign
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ticketToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTicketToDelete(null);
          }}
          title="Delete Support Ticket"
          size="medium"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete ticket "#{ticketToDelete.id.slice(-8)}" with subject "{ticketToDelete.subject}"? 
              This action cannot be undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Deleting this ticket will permanently remove all associated 
                comments and history. Consider closing the ticket instead.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTicketToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteTicket}
                disabled={deleteTicketMutation.isPending}
              >
                Delete Ticket
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};