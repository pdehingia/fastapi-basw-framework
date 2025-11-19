import { createFileRoute } from '@tanstack/react-router';
import MarketingAnalyticsPage from './MarketingAnalyticsPage';

export const Route = createFileRoute('/_protected/marketing/analytics')({
  component: MarketingAnalyticsPage,
});
