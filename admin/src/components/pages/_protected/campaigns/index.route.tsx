import { createFileRoute } from '@tanstack/react-router';
import { CampaignsDashboard } from './CampaignsDashboard';

export const Route = createFileRoute('/_protected/campaigns/')({
  component: CampaignsDashboard,
});
