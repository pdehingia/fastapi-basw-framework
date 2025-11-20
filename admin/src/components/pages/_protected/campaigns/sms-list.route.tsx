import { createFileRoute } from '@tanstack/react-router';
import { SMSCampaignsListPage } from './SMSCampaignsListPage';

export const Route = createFileRoute('/_protected/campaigns/sms-list')({
  component: SMSCampaignsListPage,
});
