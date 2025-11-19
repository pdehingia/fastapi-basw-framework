/**
 * Admin Sessions Management Route
 * Displays and manages all admin user sessions
 */

import { createFileRoute } from '@tanstack/react-router';
import AdminSessionsPage from './AdminSessionsPage';

export const Route = createFileRoute('/_protected/sessions/admin')({
  component: AdminSessionsPage,
});
