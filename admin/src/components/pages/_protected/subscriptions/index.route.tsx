import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionsDashboard } from './SubscriptionsDashboard';

export const Route = createFileRoute('/_protected/subscriptions/')({
  component: SubscriptionsDashboard,
});
