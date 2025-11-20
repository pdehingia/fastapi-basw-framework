import { createFileRoute } from '@tanstack/react-router';
import { RolesPermissionsDashboard } from './RolesPermissionsDashboard';

export const Route = createFileRoute('/_protected/roles-permissions/')({
  component: RolesPermissionsDashboard,
});
