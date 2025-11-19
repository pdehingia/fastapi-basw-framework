import { createFileRoute } from '@tanstack/react-router';
import { ApiIntegrationManagement } from '../../../organisms/ApiIntegrationManagement';

const ApiIntegrationsPage = () => {
  return <ApiIntegrationManagement />;
};

export const Route = createFileRoute('/_protected/api-integrations/')({
  component: ApiIntegrationsPage,
});