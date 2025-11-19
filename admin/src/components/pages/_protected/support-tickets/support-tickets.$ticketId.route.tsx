/**
 * Support Ticket Detail Route
 * Detailed view and management for individual tickets
 */

import { createFileRoute } from '@tanstack/react-router';
import { TicketDetailPage } from '@/components/organisms/SupportManagement/TicketDetailPage';
import { z } from 'zod';

// Parameter validation schema
const ticketParamsSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
});

function TicketDetailWrapper() {
  const { ticketId } = Route.useParams();
  return <TicketDetailPage />;
}

export const Route = createFileRoute('/_protected/support-tickets/$ticketId')({
  component: TicketDetailWrapper,
  parseParams: (params) => ticketParamsSchema.parse(params),
});