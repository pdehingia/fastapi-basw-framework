import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionsListPage } from './SubscriptionsListPage';

export const Route = createFileRoute('/_protected/subscriptions/list')({
  component: SubscriptionsListPage,
});
