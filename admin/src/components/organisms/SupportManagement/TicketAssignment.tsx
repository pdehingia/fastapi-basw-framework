/**
 * Ticket Assignment Component
 * Modal for assigning support tickets to agents
 */

import { useState } from 'react';
import { Button } from '@/components/atoms';
import { Modal, FormField } from '@/components/molecules';
import { useAssignTicket, useBulkUpdateTickets, useSupportAgents } from '@/hooks/api/useSupportTickets';
import ToastService from '@/services/toast';
import { 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface TicketAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  ticketIds: string[];
  onSuccess: () => void;
}

export const TicketAssignment = ({ isOpen, onClose, ticketIds, onSuccess }: TicketAssignmentProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [autoAssign, setAutoAssign] = useState(false);

  const assignTicketMutation = useAssignTicket();
  const bulkUpdateMutation = useBulkUpdateTickets();
  const { data: agents, isLoading: agentsLoading } = useSupportAgents();

  const availableAgents = agents?.filter(agent => agent.status === 'available') || [];
  const busyAgents = agents?.filter(agent => agent.status === 'busy') || [];
  const offlineAgents = agents?.filter(agent => agent.status === 'offline') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (autoAssign) {
      // Auto-assign logic - find agent with lowest workload
      const bestAgent = availableAgents.reduce((best, agent) => {
        if (!best) return agent;
        const bestLoad = best.active_tickets / best.max_tickets;
        const agentLoad = agent.active_tickets / agent.max_tickets;
        return agentLoad < bestLoad ? agent : best;
      }, null as typeof availableAgents[0] | null);

      if (!bestAgent) {
        ToastService.error('No available agents for auto-assignment');
        return;
      }

      try {
        if (ticketIds.length === 1) {
          await assignTicketMutation.mutateAsync({
            ticketId: ticketIds[0],
            agentId: bestAgent.id,
            notes: assignmentNotes || 'Auto-assigned based on workload'
          });
        } else {
          await bulkUpdateMutation.mutateAsync({
            ticketIds,
            updates: { assigned_to: bestAgent.id }
          });
        }
        onSuccess();
        handleClose();
      } catch (error) {
        console.error('Error auto-assigning tickets:', error);
      }
    } else {
      if (!selectedAgentId) {
        ToastService.warning('Please select an agent or use auto-assignment');
        return;
      }

      try {
        if (ticketIds.length === 1) {
          await assignTicketMutation.mutateAsync({
            ticketId: ticketIds[0],
            agentId: selectedAgentId,
            notes: assignmentNotes
          });
        } else {
          await bulkUpdateMutation.mutateAsync({
            ticketIds,
            updates: { assigned_to: selectedAgentId }
          });
        }
        onSuccess();
        handleClose();
      } catch (error) {
        console.error('Error assigning tickets:', error);
      }
    }
  };

  const handleClose = () => {
    setSelectedAgentId('');
    setAssignmentNotes('');
    setAutoAssign(false);
    onClose();
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'busy':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getWorkloadColor = (activeTickets: number, maxTickets: number) => {
    const percentage = (activeTickets / maxTickets) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const AgentCard = ({ agent, isSelected, onSelect, disabled = false }: {
    agent: typeof availableAgents[0];
    isSelected: boolean;
    onSelect: () => void;
    disabled?: boolean;
  }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        disabled 
          ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
          : isSelected 
          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
      onClick={disabled ? undefined : onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {getAgentStatusIcon(agent.status)}
            <UserIcon className="h-6 w-6 text-gray-400 ml-2" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.email}</p>
            <p className="text-xs text-gray-500">{agent.department}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${getWorkloadColor(agent.active_tickets, agent.max_tickets)}`}>
            {agent.active_tickets}/{agent.max_tickets}
          </div>
          <div className="text-xs text-gray-500">
            {Math.round((agent.active_tickets / agent.max_tickets) * 100)}% load
          </div>
          <div className="text-xs capitalize text-gray-600">
            {agent.status}
          </div>
        </div>
      </div>
      
      {/* Workload Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              (agent.active_tickets / agent.max_tickets) >= 0.9
                ? 'bg-red-500'
                : (agent.active_tickets / agent.max_tickets) >= 0.7
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${(agent.active_tickets / agent.max_tickets) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Assign ${ticketIds.length} Ticket${ticketIds.length !== 1 ? 's' : ''}`}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Auto Assignment Option */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => {
                setAutoAssign(e.target.checked);
                if (e.target.checked) {
                  setSelectedAgentId('');
                }
              }}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="ml-2 text-sm font-medium text-blue-900">
              Auto-assign to agent with lowest workload
            </span>
          </label>
          <p className="text-xs text-blue-700 mt-1">
            Automatically assigns tickets to the available agent with the lowest current workload
          </p>
        </div>

        {!autoAssign && (
          <>
            {agentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading agents...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Available Agents */}
                {availableAgents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      Available Agents ({availableAgents.length})
                    </h3>
                    <div className="grid gap-3">
                      {availableAgents.map(agent => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          isSelected={selectedAgentId === agent.id}
                          onSelect={() => setSelectedAgentId(agent.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Busy Agents */}
                {busyAgents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      Busy Agents ({busyAgents.length})
                    </h3>
                    <div className="grid gap-3">
                      {busyAgents.map(agent => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          isSelected={selectedAgentId === agent.id}
                          onSelect={() => setSelectedAgentId(agent.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline Agents */}
                {offlineAgents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                      Offline Agents ({offlineAgents.length})
                    </h3>
                    <div className="grid gap-3">
                      {offlineAgents.map(agent => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          isSelected={selectedAgentId === agent.id}
                          onSelect={() => setSelectedAgentId(agent.id)}
                          disabled={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {agents && agents.length === 0 && (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Available</h3>
                    <p className="text-gray-500">No support agents are configured in the system.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Assignment Notes */}
        <FormField
          label="Assignment Notes (Optional)"
          id="notes"
        >
          <textarea
            id="notes"
            rows={3}
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add notes about this assignment (optional)"
          />
        </FormField>

        {/* Assignment Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Assignment Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Tickets to assign: {ticketIds.length}</div>
            <div>
              Assignment method: {autoAssign ? 'Auto-assignment (lowest workload)' : selectedAgentId ? 'Manual assignment' : 'None selected'}
            </div>
            {!autoAssign && selectedAgentId && (
              <div>
                Selected agent: {agents?.find(a => a.id === selectedAgentId)?.name}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={assignTicketMutation.isPending || bulkUpdateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              (!autoAssign && !selectedAgentId) || 
              assignTicketMutation.isPending || 
              bulkUpdateMutation.isPending
            }
          >
            {assignTicketMutation.isPending || bulkUpdateMutation.isPending 
              ? 'Assigning...' 
              : `Assign ${ticketIds.length} Ticket${ticketIds.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};