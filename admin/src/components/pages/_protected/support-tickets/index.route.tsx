/**
 * Support Tickets Index Route
 * Main support ticket list and management interface
 */

import { createFileRoute } from '@tanstack/react-router';
import { SupportTicketList } from '@/components/organisms/SupportManagement/SupportTicketList';

export const Route = createFileRoute('/_protected/support-tickets/')({
  component: SupportTicketList,
});