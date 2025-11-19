/**
 * Customer Sessions Management Route
 * Displays and manages all customer user sessions
 */

import { createFileRoute } from '@tanstack/react-router';
import CustomerSessionsPage from './CustomerSessionsPage';

export const Route = createFileRoute('/_protected/sessions/customer')({
  component: CustomerSessionsPage,
});
