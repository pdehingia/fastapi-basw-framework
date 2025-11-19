/**
 * Dashboard Page Route
 * Main dashboard for Maya Admin Panel with real API integration
 */

import { createFileRoute } from '@tanstack/react-router';
import DashboardPage from './dashboardPageNew';

export const Route = createFileRoute('/_protected/dashboard/')({
  component: DashboardPage,
});
