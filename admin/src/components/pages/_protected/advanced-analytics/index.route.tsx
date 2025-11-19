import { createFileRoute } from '@tanstack/react-router';
import { AdvancedAnalytics } from '../../../pages';

/**
 * Advanced Analytics & Reporting Route
 * Path: /advanced-analytics
 */
export const Route = createFileRoute('/_protected/advanced-analytics/')({
  component: AdvancedAnalytics,
  meta: () => [
    {
      title: 'Advanced Analytics & Reporting - Maya Admin',
    },
    {
      name: 'description',
      content: 'Advanced reporting, dashboards, and data visualization tools',
    },
  ],
  beforeLoad: () => {
    // Add any authentication/authorization checks here
    return {};
  },
});