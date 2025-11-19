/**
 * Admin Users Detail Page Route
 * Individual admin user details and management
 */

import { createFileRoute } from '@tanstack/react-router';
import { AdminUserDetailPage } from '@/components/pages/_protected/admin-users/AdminUserDetailPage';

export const Route = createFileRoute('/_protected/admin-users/admin-users/$adminUserId')({
  component: AdminUserDetailPage,
});