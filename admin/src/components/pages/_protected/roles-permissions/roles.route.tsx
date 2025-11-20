import { createFileRoute } from '@tanstack/react-router';
import { RolesListPage } from './RolesListPage';

export const Route = createFileRoute('/_protected/roles-permissions/roles')({
  component: RolesListPage,
});
