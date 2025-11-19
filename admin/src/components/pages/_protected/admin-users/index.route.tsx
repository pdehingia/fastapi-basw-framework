/**
 * Admin Users List Page Route
 * Manages admin users with CRUD operations
 */

import { createFileRoute } from '@tanstack/react-router';
import { AdminUsersListPage } from '@/components/pages/_protected/admin-users/AdminUsersListPage';

export const Route = createFileRoute('/_protected/admin-users/')({
  component: AdminUsersListPage,
});