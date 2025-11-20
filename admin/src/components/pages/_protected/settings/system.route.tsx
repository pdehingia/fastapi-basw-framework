import { createFileRoute } from '@tanstack/react-router';
import SystemConfigurationPage from './SystemConfigurationPage';

export const Route = createFileRoute('/_protected/settings/system')({
  component: SystemConfigurationPage,
});
