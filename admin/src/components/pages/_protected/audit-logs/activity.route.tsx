import { createFileRoute } from '@tanstack/react-router';
import { ActivityLogsPage } from './ActivityLogsPage';

export const Route = createFileRoute('/_protected/audit-logs/activity')({
  component: ActivityLogsPage,
});
