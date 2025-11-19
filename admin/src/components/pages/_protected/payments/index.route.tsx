/**
 * Payments Main Route
 * Main payment management route
 */

import { createFileRoute } from '@tanstack/react-router';
import PaymentManagement from './PaymentManagement';

export const Route = createFileRoute('/_protected/payments/')({
  component: PaymentManagement,
});