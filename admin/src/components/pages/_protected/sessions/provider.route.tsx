/**
 * Provider Sessions Management Route
 * Displays and manages all provider user sessions
 */

import { createFileRoute } from '@tanstack/react-router';
import ProviderSessionsPage from './ProviderSessionsPage';

export const Route = createFileRoute('/_protected/sessions/provider')({
  component: ProviderSessionsPage,
});
