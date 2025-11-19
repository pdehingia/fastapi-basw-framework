/**
 * Payment Detail Page
 * Detailed view of individual payment with actions
 */

import { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Button from '../../atoms/Button';
import Badge from '../../atoms/Badge';
import Modal from '../../molecules/Modal';
import Input from '../../atoms/Input';
import Select from '../../atoms/Select/Select';
import { paymentService, PaymentDetail, RefundRequest, RefundRecord } from '../../../services/api/paymentService';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { useToast } from '../../../hooks/ui/useToast';

export default function PaymentDetailPage() {
  const [paymentId, setPaymentId] = useState<string>('');
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundData, setRefundData] = useState<RefundRequest>({
    amount: 0,
    reason: '',
    refund_type: 'partial',
    admin_notes: '',
    notify_customer: true,
    processing_fee_waived: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    // Get payment ID from URL path
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    setPaymentId(id);
  }, []);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetail();
    }
  }, [paymentId]);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentDetail(paymentId);
      setPayment(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payment details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = () => {
    if (!payment) return;
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
    if (!payment) return;

    try {
      await paymentService.processRefund(payment.id, refundData);
      toast({
        title: 'Success',
        description: 'Refund processed successfully',
        variant: 'success',
      });
      setRefundModalOpen(false);
      fetchPaymentDetail(); // Refresh the payment details
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'refunded':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'disputed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'disputed':
        return 'destructive';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Payment not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The payment you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Button
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => window.open('/payments', '_self')}
          >
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => window.open('/payments', '_self')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Payment Details
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Transaction ID: {payment.transaction_id}
            </p>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          {payment.status === 'completed' && (
            <Button leftIcon={<ArrowPathIcon className="w-4 h-4" />} onClick={openRefundModal}>
              Process Refund
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Info */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Net: {formatCurrency(payment.net_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(payment.status)}
                  <Badge variant={getStatusVariant(payment.status) as any}>
                    {payment.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{payment.customer_name}</div>
                        <div className="text-gray-500">{payment.customer_email}</div>
                      </div>
                    </div>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Provider</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{payment.provider_name}</div>
                        <div className="text-gray-500">{payment.provider_email}</div>
                      </div>
                    </div>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {payment.payment_method.replace('_', ' ')}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Currency</dt>
                  <dd className="mt-1 text-sm text-gray-900">{payment.currency}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Processing Fee</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(payment.processing_fee)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Platform Fee</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(payment.platform_fee)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDateTime(payment.created_at)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDateTime(payment.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Booking Details
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Service Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {payment.booking_details.service_type}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Booking Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{formatDateTime(payment.booking_details.booking_date)}</span>
                    </div>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {payment.booking_details.duration} minutes
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {payment.booking_details.location}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dispute Info */}
          {payment.dispute_info && (
            <div className="bg-red-50 border border-red-200 rounded-lg">
              <div className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <h4 className="text-sm font-medium text-red-800">Dispute Active</h4>
                </div>
                <div className="mt-2 text-sm text-red-700">
                  <p><strong>Reason:</strong> {payment.dispute_info.reason}</p>
                  <p><strong>Filed by:</strong> {payment.dispute_info.filed_by}</p>
                  <p><strong>Status:</strong> {payment.dispute_info.status}</p>
                  <p><strong>Filed at:</strong> {formatDateTime(payment.dispute_info.filed_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Refund History */}
          {payment.refund_history && payment.refund_history.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Refund History
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {payment.refund_history.map((refund: RefundRecord, index: number) => (
                    <li key={index} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(refund.amount)}
                          </p>
                          <p className="text-sm text-gray-500">{refund.reason}</p>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(refund.processed_at)} by {refund.processed_by}
                          </p>
                        </div>
                        <Badge 
                          variant={refund.status === 'completed' ? 'success' : 'warning'}
                        >
                          {refund.status}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
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
                  amount: value === 'full' ? payment.amount : 0,
                }))
              }
              options={[
                { value: 'full', label: 'Full Refund' },
                { value: 'partial', label: 'Partial Refund' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Refund Amount
              <span className="text-gray-500 ml-1">
                (Max: {formatCurrency(payment.amount)})
              </span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={refundData.amount}
              onChange={(e) =>
                setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
              }
              max={payment.amount}
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