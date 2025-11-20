import { createFileRoute } from '@tanstack/react-router';
import { EmailCampaignsListPage } from './EmailCampaignsListPage';

export const Route = createFileRoute('/_protected/campaigns/email-list')({
  component: EmailCampaignsListPage,
});
