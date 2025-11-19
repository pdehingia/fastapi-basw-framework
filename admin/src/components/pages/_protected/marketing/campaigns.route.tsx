/**
 * Marketing Campaigns Route
 * Campaign management page
 */

import { createFileRoute } from '@tanstack/react-router';
import CampaignsListPage from './CampaignsListPage';

export const Route = createFileRoute('/_protected/marketing/campaigns')({
  component: CampaignsListPage,
});
