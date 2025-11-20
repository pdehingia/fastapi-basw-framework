import { createFileRoute } from '@tanstack/react-router';
import PlatformAnalyticsPage from './PlatformAnalyticsPage';

export const Route = createFileRoute('/_protected/analytics/platform')({
  component: PlatformAnalyticsPage,
});
