/**
 * Payment Disputes Route
 * Payment disputes management route
 */

import { createFileRoute } from '@tanstack/react-router';
import PaymentDisputes from './PaymentDisputes';

export const Route = createFileRoute('/_protected/payments/disputes')({
  component: PaymentDisputes,
});