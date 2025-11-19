/**
 * Marketing Overview Route
 * Main marketing dashboard with navigation and statistics
 */

import { createFileRoute } from '@tanstack/react-router';
import MarketingDashboard from './MarketingDashboard';

export const Route = createFileRoute('/_protected/marketing/')({
  component: MarketingDashboard,
});
