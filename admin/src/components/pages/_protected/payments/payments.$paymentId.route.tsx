/**
 * Payment Detail Route
 * Individual payment detail route with parameter validation
 */

import { createFileRoute } from '@tanstack/react-router';
import PaymentDetailPage from './PaymentDetailPage';

export const Route = createFileRoute('/_protected/payments/payments/$paymentId')({
  component: PaymentDetailPage,
  parseParams: (params) => ({
    paymentId: params.paymentId,
  }),
});