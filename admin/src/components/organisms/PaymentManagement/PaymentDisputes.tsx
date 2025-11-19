/**
 * Payment Disputes Page
 * Manage and resolve payment disputes
 */

import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import Button from '../../atoms/Button';
import Table from '../../molecules/Table';
import { Select } from '../../atoms';
import Modal from '../../molecules/Modal';
import { Input } from '../../atoms';
import { Badge } from '../../atoms';
import { paymentService, DisputeInfo, DisputeResolution } from '../../../services/api/paymentService';
import { formatDateTime } from '../../../utils/formatters';
import { useToast } from '../../../hooks/ui/useToast';

export default function PaymentDisputes() {
  const [disputes, setDisputes] = useState<DisputeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ status?: string; page?: number }>({
    status: 'open',
    page: 1,
  });
  const [selectedDispute, setSelectedDispute] = useState<DisputeInfo | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionData, setResolutionData] = useState<DisputeResolution>({
    resolution: 'favor_customer',
    admin_notes: '',
  });
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
  }, [filters]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getDisputes(filters);
      setDisputes(response.items);
      setTotalItems(response.metadata.total_items);
      setCurrentPage(response.metadata.page);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch disputes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openResolveModal = (dispute: DisputeInfo) => {
    setSelectedDispute(dispute);
    setResolutionData({
      resolution: 'favor_customer',
      admin_notes: '',
    });
    setResolveModalOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;

    try {
      await paymentService.resolveDispute(selectedDispute.id, resolutionData);
      toast({
        title: 'Success',
        description: 'Dispute resolved successfully',
        variant: 'success',
      });
      setResolveModalOpen(false);
      fetchDisputes(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve dispute',
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'investigating':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'investigating':
        return <ClockIcon className="h-4 w-4" />;
      case 'resolved':
        return <CheckIcon className="h-4 w-4" />;
      case 'closed':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Dispute ID',
      cell: (dispute: DisputeInfo) => (
        <div className="font-mono text-sm text-gray-600">
          #{dispute.id.slice(-6)}
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (dispute: DisputeInfo) => (
        <div>
          <div className="font-medium text-gray-900">{dispute.reason}</div>
          <div className="text-sm text-gray-500">
            Filed by: {dispute.filed_by}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (dispute: DisputeInfo) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(dispute.status)}
          <Badge variant={getStatusVariant(dispute.status)}>
            {dispute.status.replace('_', ' ')}
          </Badge>
        </div>
      ),
    },
    {
      key: 'filed_at',
      header: 'Filed Date',
      cell: (dispute: DisputeInfo) => (
        <div className="text-sm text-gray-900">
          {formatDateTime(dispute.filed_at)}
        </div>
      ),
    },
    {
      key: 'resolved_at',
      header: 'Resolved Date',
      cell: (dispute: DisputeInfo) => (
        <div className="text-sm text-gray-900">
          {dispute.resolved_at ? formatDateTime(dispute.resolved_at) : '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (dispute: DisputeInfo) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<EyeIcon className="w-4 h-4" />}
            onClick={() => window.open(`/payments/disputes/${dispute.id}`, '_blank')}
          >
            View
          </Button>
          {dispute.status === 'open' && (
            <Button
              size="sm"
              leftIcon={<CheckIcon className="w-4 h-4" />}
              onClick={() => openResolveModal(dispute)}
            >
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  const StatsCard = ({ title, value, icon: Icon, color = 'blue' }: any) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && disputes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Payment Disputes
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and resolve payment disputes and chargebacks
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => window.open('/payments', '_self')}
          >
            Back to Payments
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <StatsCard
          title="Open Disputes"
          value="8"
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatsCard
          title="Investigating"
          value="5"
          icon={ClockIcon}
          color="yellow"
        />
        <StatsCard
          title="Resolved"
          value="42"
          icon={CheckIcon}
          color="green"
        />
        <StatsCard
          title="Total Value"
          value="$12,450"
          icon={CurrencyDollarIcon}
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          
          <div className="flex items-center space-x-4">
            <div>
              <Select
                value={filters.status || ''}
                onChange={(value: string) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'investigating', label: 'Investigating' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' }
                ]}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          data={disputes}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            totalItems,
            pageSize: 20,
            onPageChange: (page) => setFilters(prev => ({ ...prev, page })),
          }}
        />
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Dispute"
        size="large"
      >
        {selectedDispute && (
          <div className="space-y-6">
            {/* Dispute Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Dispute Details</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Reason:</strong> {selectedDispute.reason}</div>
                <div><strong>Filed by:</strong> {selectedDispute.filed_by}</div>
                <div><strong>Filed at:</strong> {formatDateTime(selectedDispute.filed_at)}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Resolution</label>
              <Select
                value={resolutionData.resolution}
                onChange={(value: string) =>
                  setResolutionData(prev => ({ ...prev, resolution: value as 'favor_customer' | 'favor_provider' | 'no_fault' }))
                }
                options={[
                  { value: 'favor_customer', label: 'Favor Customer' },
                  { value: 'favor_provider', label: 'Favor Provider' },
                  { value: 'no_fault', label: 'No Fault / Compromise' }
                ]}
              />
            </div>

            {resolutionData.resolution === 'favor_customer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Refund Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={resolutionData.refund_amount || 0}
                  onChange={(e) =>
                    setResolutionData(prev => ({ 
                      ...prev, 
                      refund_amount: parseFloat(e.target.value) || 0 
                    }))
                  }
                  placeholder="Enter refund amount..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={4}
                value={resolutionData.admin_notes}
                onChange={(e) => setResolutionData(prev => ({ ...prev, admin_notes: e.target.value }))}
                placeholder="Explain the resolution decision and any actions taken..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResolve} disabled={!resolutionData.admin_notes.trim()}>
                Resolve Dispute
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}