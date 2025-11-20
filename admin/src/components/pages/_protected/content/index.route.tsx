import { createFileRoute } from '@tanstack/react-router';
import { ContentDashboard } from './ContentDashboard';

export const Route = createFileRoute('/_protected/content/')({
  component: ContentDashboard,
});
