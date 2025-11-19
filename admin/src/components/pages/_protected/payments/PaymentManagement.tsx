/**
 * Payment Management Page
 * Comprehensive payment administration interface
 */

import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import Button from '../../../atoms/Button';
import Table from '../../../molecules/Table';
import Select from '../../../atoms/Select/Select';
import Modal from '../../../molecules/Modal';
import Input from '../../../atoms/Input';
import Badge from '../../../atoms/Badge';
import { paymentService, Payment, PaymentFilters, RefundRequest } from '../../../../services/api/paymentService';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { useToast } from '../../../../hooks/ui/useToast';

interface PaymentStats {
  total_payments: number;
  total_revenue: number;
  pending_payments: number;
  disputed_payments: number;
  refunded_amount: number;
  processing_fees: number;
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    page_size: 20,
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundData, setRefundData] = useState<RefundRequest>({
    amount: 0,
    reason: '',
    refund_type: 'partial',
    admin_notes: '',
    notify_customer: true,
    processing_fee_waived: false,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPayments(filters);
      setPayments(response.items);
      setTotalItems(response.metadata.total_items);
      setCurrentPage(response.metadata.page);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // This would be a separate endpoint for payment dashboard stats
      const mockStats: PaymentStats = {
        total_payments: 1247,
        total_revenue: 52400.75,
        pending_payments: 23,
        disputed_payments: 3,
        refunded_amount: 2840.50,
        processing_fees: 1562.02,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const openRefundModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount,
      reason: '',
      refund_type: 'full',
      admin_notes: '',
      notify_customer: true,
      processing_fee_waived: false,
    });
    setRefundModalOpen(true);
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;

    try {
      await paymentService.processRefund(selectedPayment.id, refundData);
      toast({
        title: 'Success',
        description: 'Refund processed successfully',
        variant: 'success',
      });
      setRefundModalOpen(false);
      fetchPayments(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await paymentService.exportPaymentData({
        format,
        date_range: {
          start_date: '2024-01-01',
          end_date: new Date().toISOString().split('T')[0],
        },
        filters,
        include_refunds: true,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Export completed successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const statusVariants = {
    pending: 'warning',
    completed: 'success',
    failed: 'error',
    refunded: 'info',
    disputed: 'error',
  } as const;

  const paymentMethodIcons = {
    credit_card: CreditCardIcon,
    debit_card: CreditCardIcon,
    paypal: CreditCardIcon,
    bank_transfer: BanknotesIcon,
  };

  const columns = [
    {
      key: 'transaction_id',
      header: 'Transaction ID',
      cell: (payment: Payment) => (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm text-gray-600">
            {payment.transaction_id}
          </span>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      cell: (payment: Payment) => (
        <div>
          <div className="font-medium text-gray-900">{payment.customer_name}</div>
          <div className="text-sm text-gray-500">Provider: {payment.provider_name}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment: Payment) => (
        <div>
          <div className="font-medium text-gray-900">
            {formatCurrency(payment.amount)}
          </div>
          <div className="text-sm text-gray-500">
            Net: {formatCurrency(payment.net_amount)}
          </div>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Method',
      cell: (payment: Payment) => {
        const Icon = paymentMethodIcons[payment.payment_method];
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-gray-400" />
            <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment: Payment) => (
        <Badge variant={statusVariants[payment.status]}>
          {payment.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      cell: (payment: Payment) => (
        <div className="text-sm text-gray-900">
          {formatDate(payment.created_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (payment: Payment) => (
        <div className="flex items-center space-x-2">
          <Link 
            to="/payments/payments/$paymentId" 
            params={{ paymentId: payment.id }}
          >
            <Button variant="outline" size="sm" leftIcon={<EyeIcon className="w-4 h-4" />}>
              View
            </Button>
          </Link>
          {payment.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              onClick={() => openRefundModal(payment)}
            >
              Refund
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

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading payments...</p>
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
            Payment Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and manage all payments, refunds, and disputes
          </p>
        </div>
        <div className="mt-4 flex space-x-2 sm:mt-0">
          <Button
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            variant="outline"
            onClick={() => handleExport('excel')}
          >
            Export Excel
          </Button>
          <Link to="/payments/disputes">
            <Button leftIcon={<ExclamationTriangleIcon className="w-4 h-4" />} variant="outline">
              View Disputes
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.total_revenue)}
            icon={CurrencyDollarIcon}
            color="green"
          />
          <StatsCard
            title="Total Payments"
            value={stats.total_payments.toLocaleString()}
            icon={CreditCardIcon}
            color="blue"
          />
          <StatsCard
            title="Pending Payments"
            value={stats.pending_payments}
            icon={CalendarIcon}
            color="yellow"
          />
          <StatsCard
            title="Disputed Payments"
            value={stats.disputed_payments}
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <StatsCard
            title="Refunded Amount"
            value={formatCurrency(stats.refunded_amount)}
            icon={ArrowPathIcon}
            color="orange"
          />
          <StatsCard
            title="Processing Fees"
            value={formatCurrency(stats.processing_fees)}
            icon={BanknotesIcon}
            color="purple"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <Select
              value={filters.status || ''}
              onChange={(value: string) => handleFilterChange('status', value)}
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' },
                { value: 'disputed', label: 'Disputed' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <Select
              value={filters.payment_method || ''}
              onChange={(value: string) => handleFilterChange('payment_method', value)}
              placeholder="All Methods"
              options={[
                { value: '', label: 'All Methods' },
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'debit_card', label: 'Debit Card' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date From</label>
            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date To</label>
            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          data={payments}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            totalItems,
            pageSize: filters.page_size || 20,
            onPageChange: handlePageChange,
          }}
        />
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Process Refund"
        size="large"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Refund Type</label>
            <Select
              value={refundData.refund_type}
              onChange={(value: string) =>
                setRefundData(prev => ({
                  ...prev,
                  refund_type: value as 'full' | 'partial',
                  amount: value === 'full' ? selectedPayment?.amount || 0 : 0,
                }))
              }
              options={[
                { value: 'full', label: 'Full Refund' },
                { value: 'partial', label: 'Partial Refund' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Refund Amount
              {selectedPayment && (
                <span className="text-gray-500 ml-1">
                  (Max: {formatCurrency(selectedPayment.amount)})
                </span>
              )}
            </label>
            <Input
              type="number"
              step="0.01"
              value={refundData.amount}
              onChange={(e) =>
                setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
              }
              max={selectedPayment?.amount}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <Input
              value={refundData.reason}
              onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter refund reason..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={3}
              value={refundData.admin_notes}
              onChange={(e) => setRefundData(prev => ({ ...prev, admin_notes: e.target.value }))}
              placeholder="Internal notes about this refund..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={refundData.notify_customer}
                onChange={(e) =>
                  setRefundData(prev => ({ ...prev, notify_customer: e.target.checked }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Notify customer via email</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={refundData.processing_fee_waived}
                onChange={(e) =>
                  setRefundData(prev => ({ ...prev, processing_fee_waived: e.target.checked }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Waive processing fee</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund}>
              Process Refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}