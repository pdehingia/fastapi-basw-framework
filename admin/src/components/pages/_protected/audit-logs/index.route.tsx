import { createFileRoute } from '@tanstack/react-router';
import { AuditLogsDashboard } from './AuditLogsDashboard';

export const Route = createFileRoute('/_protected/audit-logs/')({
  component: AuditLogsDashboard,
});
